import { describe, expect, it, vi } from 'vitest';
import { NewsStatus } from '@/modules/news/domain/news';
import { SaveNewsDraftCommand } from '@/modules/news/application/use-cases/command/save-news-draft.command';
import { PublishNewsCommand } from '@/modules/news/application/use-cases/command/publish-news.command';
import { SetNewsCommentsEnabledCommand } from '@/modules/news/application/use-cases/command/set-news-comments-enabled.command';
import { SubmitNewsSuggestionCommand } from '@/modules/news/application/use-cases/command/submit-news-suggestion.command';
import { NewsPolicy } from '@/modules/news/application/news.policy';
import { Role } from '@/shared/kernel/auth/role';
import { news } from '@test/content/domain/fixtures';

describe('News commands', () => {
  it('allows Curator and Administrator editorial management while keeping Moderator out of it', () => {
    const policy = new NewsPolicy();

    expect(() => policy.canManage({ sub: 'curator-1', role: Role.CURATOR })).not.toThrow();
    expect(() => policy.canManage({ sub: 'moderator-1', role: Role.MODERATOR })).toThrow('FORBIDDEN');
    expect(() => policy.canManage({ sub: 'administrator-1', role: Role.ADMIN })).not.toThrow();
  });

  it('keeps News deletion restricted to Administrator', () => {
    const policy = new NewsPolicy();

    expect(() => policy.canDelete({ sub: 'admin-1', role: Role.ADMIN })).not.toThrow();
    expect(() => policy.canDelete({ sub: 'curator-1', role: Role.CURATOR })).toThrow('FORBIDDEN');
  });

  it('NEWS-RN-009/NEWS-RF-011 — Curator toggles News commentsEnabled on the News aggregate without touching the Comment thread', async () => {
    const entity = news();
    const save = vi.fn(async () => true);
    await new SetNewsCommentsEnabledCommand(
      { findById: vi.fn(async () => entity), save } as never,
      new NewsPolicy(),
    ).execute({ sub: 'curator-1', role: Role.CURATOR }, entity.id, false);
    expect(entity.commentsEnabled).toBe(false);
    expect(save).toHaveBeenCalledWith(entity);
  });

  it('rejects a suggestion whose normalized source URL is already linked to News', async () => {
    const command = new SubmitNewsSuggestionCommand(
      { findPendingByUrl: async () => null } as never,
      { findNewsByUrl: async () => 'news-1' } as never,
    );

    await expect(command.execute('user-1', { url: 'https://example.com/story#tracking' })).rejects.toMatchObject({
      code: 'NEWS_ALREADY_EXISTS',
    });
  });

  it('creates draft news and resolves its declared tags', async () => {
    const calls: string[] = [];
    let persistedStatus: NewsStatus | undefined;
    const taxonomy = {
      validateTags: async () => {
        calls.push('validate-classification');

        return { tagSlugs: ['tag'] };
      },
    };
    const repository = {
      transaction: async (work: (context: unknown) => Promise<unknown>) => work({}),
      slugExists: async () => false,
      create: async (entity: { status: NewsStatus }) => {
        calls.push('create');
        persistedStatus = entity.status;

        return 'news-1';
      },
    };
    const queryRepository = {
      findById: async () => {
        calls.push('find-by-id');

        return { id: 'news-1' };
      },
    };

    await new SaveNewsDraftCommand(
      repository as never,
      queryRepository as never,
      taxonomy as never,
      { confirmImageUpload: async () => null } as never,
      new NewsPolicy(),
      { link: async () => undefined } as never,
      { create: async () => ({ id: 'resource-1' }) } as never,
    ).execute(
      { sub: 'curator-1', role: Role.CURATOR },
      {
        title: 'News',
        summary: 'Summary',
        description: 'A concise editorial description for this news item.',
        content: 'Content',
        tagSlugs: ['tag'],
      },
    );

    expect(persistedStatus).toBe(NewsStatus.Draft);
    expect(calls).toEqual(expect.arrayContaining(['validate-classification', 'create', 'find-by-id']));
  });

  it('does not emit Discord publication when News loses the lifecycle CAS', async () => {
    const entity = news();
    const emitAsync = vi.fn(async () => []);
    const command = new PublishNewsCommand(
      { findById: async () => entity, save: vi.fn(async () => false) } as never,
      new NewsPolicy(),
      { getResourceTagSlugs: async () => ['typescript'] } as never,
      { emitAsync } as never,
      { hasForNews: async () => true } as never,
    );

    await expect(command.execute({ sub: 'curator-1', role: Role.CURATOR }, entity.id, {})).rejects.toMatchObject({
      code: 'NEWS_INVALID_STATUS',
    });
    expect(emitAsync).not.toHaveBeenCalled();
  });
});
