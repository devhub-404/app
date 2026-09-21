import { describe, expect, it, vi } from 'vitest';
import { CreateQuestionCommand } from '@/modules/q-and-a/application/use-cases/command/create-question.command';
import { CreateAnswerCommand } from '@/modules/q-and-a/application/use-cases/command/create-answer.command';
import { AcceptAnswerCommand } from '@/modules/q-and-a/application/use-cases/command/accept-answer.command';
import { RemoveAcceptedAnswerCommand } from '@/modules/q-and-a/application/use-cases/command/remove-accepted-answer.command';
import { CloseQuestionCommand } from '@/modules/q-and-a/application/use-cases/command/close-question.command';
import { ReopenQuestionCommand } from '@/modules/q-and-a/application/use-cases/command/reopen-question.command';
import { ListQuestionsQuery } from '@/modules/q-and-a/application/use-cases/query/list-questions.query';
import { GetQuestionQuery } from '@/modules/q-and-a/application/use-cases/query/get-question.query';
import { QAndAPublicService } from '@/modules/q-and-a/public/q-and-a-public.service';
import type { QAndARepository } from '@/modules/q-and-a/application/ports/repositories';

function repository(overrides: Partial<QAndARepository> = {}): QAndARepository {
  return {
    transaction: vi.fn(async (work: (context: unknown) => Promise<unknown>) => work({ transaction: true })),
    createQuestion: vi.fn(),
    list: vi.fn(),
    search: vi.fn(),
    listPublicContributionsByAuthor: vi.fn(),
    listContributionsByAuthor: vi.fn(),
    getQuestion: vi.fn(),
    findQuestion: vi.fn(),
    getAnswer: vi.fn(),
    findAnswer: vi.fn(),
    createAnswer: vi.fn(),
    acceptAnswer: vi.fn(),
    removeAcceptedAnswer: vi.fn(),
    closeQuestion: vi.fn(),
    reopenQuestion: vi.fn(),
    deleteQuestion: vi.fn(),
    deleteAnswer: vi.fn(),
    moderateTarget: vi.fn(),
    resolveTarget: vi.fn(),
    listHiddenForModeration: vi.fn(),
    ...overrides,
  } as unknown as QAndARepository;
}

const question = {
  id: '11111111-1111-4111-8111-111111111111',
  authorAccountId: 'author',
  title: 't',
  content: 'c',
  status: 'open' as const,
  acceptedAnswerId: null,
  createdAt: '2026-08-17T00:00:00.000Z',
  tagSlugs: [],
  answers: [],
};
const answer = {
  id: '22222222-2222-4222-8222-222222222222',
  questionId: question.id,
  authorAccountId: 'answerer',
  content: 'a',
  createdAt: '2026-08-17T00:00:00.000Z',
  votes: 0,
};

describe('Q&A use cases', () => {
  it('does not expose hidden Q&A targets as public interaction capabilities', async () => {
    const hiddenRepository = repository({
      resolveTarget: vi.fn(async () => ({ type: 'question', isPublic: false })),
      getQuestion: vi.fn(async () => null),
      findQuestion: vi.fn(async () => null),
    });
    const hiddenService = new QAndAPublicService(hiddenRepository, hiddenRepository as never);
    await expect(hiddenService.resolveAccess(question.id)).resolves.toBeNull();

    const visibleRepository = repository({
      resolveTarget: vi.fn(async () => ({ type: 'question', isPublic: true })),
      getQuestion: vi.fn(async () => question),
      findQuestion: vi.fn(async () => question),
    });
    const visibleService = new QAndAPublicService(visibleRepository, visibleRepository as never);
    await expect(visibleService.resolveAccess(question.id)).resolves.toEqual({
      isPublic: true,
      ownerAccountId: question.authorAccountId,
    });
  });

  it('creates ResourceIdentity + Question + classification in one transaction', async () => {
    const context = { transaction: true };
    const created = { ...question, id: '33333333-3333-4333-8333-333333333333' };
    const repo = repository({
      transaction: vi.fn(async (work) => work(context)),
      createQuestion: vi.fn(async () => created),
    });
    const taxonomy = {
      validateTags: vi.fn(async () => ({ tagSlugs: ['typescript'] })),
      setResourceClassification: vi.fn(async () => undefined),
    };
    const identities = { create: vi.fn(async () => ({ id: created.id, kind: 'question' })) };
    const command = new CreateQuestionCommand(
      repo,
      taxonomy as never,
      { assertAccountCapability: async () => undefined },
      identities as never,
    );

    await command.execute('author', { title: 't', content: 'c', tagSlugs: ['typescript'] });
    expect(identities.create).toHaveBeenCalledWith('question', context);
    expect(repo.createQuestion).toHaveBeenCalledWith(created.id, 'author', 't', 'c', context);
    expect(taxonomy.setResourceClassification).toHaveBeenCalledWith(created.id, { tagSlugs: ['typescript'] }, context);
  });

  it('creates Answer as its own Resource and notifies a different Question author', async () => {
    const context = { transaction: true };
    const repo = repository({
      transaction: vi.fn(async (work) => work(context)),
      getQuestion: vi.fn(async () => question),
      createAnswer: vi.fn(async () => answer),
    });
    const notifications = { notify: vi.fn(async () => undefined) };
    const identities = { create: vi.fn(async () => ({ id: answer.id, kind: 'answer' })) };
    await new CreateAnswerCommand(
      repo,
      notifications as never,
      { assertAccountCapability: async () => undefined },
      identities as never,
    ).execute('answerer', question.id, { content: 'a' });
    expect(repo.createAnswer).toHaveBeenCalledWith(answer.id, question.id, 'answerer', 'a', context);
    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: 'author',
        sourceType: 'answer',
        sourceId: answer.id,
        targetType: 'question',
        targetId: question.id,
      }),
    );
  });

  it('keeps accepted-answer and OPEN/CLOSED transitions independent', async () => {
    const repo = repository({
      acceptAnswer: vi.fn(async () => ({ ...question, acceptedAnswerId: answer.id })),
      removeAcceptedAnswer: vi.fn(async () => ({ ...question, acceptedAnswerId: null })),
      closeQuestion: vi.fn(async () => ({ ...question, status: 'closed' as const })),
      reopenQuestion: vi.fn(async () => question),
    });
    await expect(new AcceptAnswerCommand(repo).execute('author', question.id, answer.id)).resolves.toMatchObject({
      acceptedAnswerId: answer.id,
    });
    await expect(new RemoveAcceptedAnswerCommand(repo).execute('author', question.id)).resolves.toMatchObject({
      acceptedAnswerId: null,
    });
    await expect(new CloseQuestionCommand(repo).execute(question.id)).resolves.toMatchObject({ status: 'closed' });
    await expect(new ReopenQuestionCommand(repo).execute(question.id)).resolves.toMatchObject({ status: 'open' });
  });

  it('returns the projections supplied by the Q&A repository', async () => {
    const projectedQuestion = { ...question, tagSlugs: ['typescript'], answers: [{ ...answer, votes: 4 }] };
    const list = vi.fn(async () => ({ items: [projectedQuestion], total: 1, page: 1, pageSize: 20 }));
    const repo = repository({
      list,
      search: list,
      getQuestion: vi.fn(async () => projectedQuestion),
      findQuestion: vi.fn(async () => projectedQuestion),
    });
    await expect(new ListQuestionsQuery(repo).execute({ page: 1, pageSize: 20 })).resolves.toMatchObject({
      items: [expect.objectContaining({ tagSlugs: ['typescript'] })],
    });
    await expect(new GetQuestionQuery(repo).execute(question.id)).resolves.toMatchObject({
      tagSlugs: ['typescript'],
      answers: [expect.objectContaining({ id: answer.id, votes: 4 })],
    });
  });
});
