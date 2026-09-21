import { randomUUID } from 'node:crypto';
import { AccountProfileReadPort } from '@/modules/account/public/account-profile-read.port';
import { and, asc, count, countDistinct, desc, eq, ilike, inArray, isNotNull, isNull, or, sql } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { answersSchema, questionsSchema } from '@/shared/infrastructure/database/drizzle/schema/q-and-a/q-and-a.schema';
import { voteStatisticsSchema } from '@/shared/infrastructure/database/drizzle/schema/vote/vote-statistics.schema';
import { resourceTagAssignmentsSchema } from '@/shared/infrastructure/database/drizzle/schema/taxonomy/resource-tags.schema';
import { tagsSchema } from '@/shared/infrastructure/database/drizzle/schema/taxonomy/tags.schema';
import type { AnswerDTO, ListQuestionsDTO, PaginatedQuestionsDTO, QuestionDTO } from '../../application/dtos';
import type { QAndAContributionRow, QAndAViewer } from '../../application/ports/repositories/q-and-a.repository';
import { QAndARepository } from '../../application/ports/repositories';
import { QAndAQueryRepository } from '../../application/ports/repositories/q-and-a.query.repository';
import type { QAndASearchCriteria } from '../../application/ports/repositories/q-and-a-search.criteria';
import { Role } from '@/shared/kernel/auth/role';
import { ResourceIdentityStore } from '@/shared/infrastructure/database/drizzle/resource-identity.store';
import { Answer, Question } from '@/modules/q-and-a/domain';

type DrizzleTransaction = Parameters<DrizzleDatabaseService['transaction']>[0] extends (tx: infer T) => unknown
  ? T
  : never;
type Executor = DrizzleDatabaseService | DrizzleTransaction;

@Injectable()
export class DrizzleQAndARepository implements QAndARepository, QAndAQueryRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    private readonly profiles: AccountProfileReadPort,
    private readonly resources: ResourceIdentityStore,
  ) {}

  async transaction<T>(work: (context: unknown) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => work(tx));
  }

  async createQuestion(
    id: string,
    authorAccountId: string,
    title: string,
    content: string,
    context?: unknown,
  ): Promise<QuestionDTO> {
    const executor = (context as Executor | undefined) ?? this.db;
    await this.resources.assertKind(id, 'question', executor);
    const question = Question.create({ id, authorAccountId, title, content });
    const [row] = await executor.insert(questionsSchema).values(question.value).returning({
      id: questionsSchema.id,
      authorAccountId: questionsSchema.authorAccountId,
      title: questionsSchema.title,
      content: questionsSchema.content,
      status: questionsSchema.status,
      acceptedAnswerId: questionsSchema.acceptedAnswerId,
      hiddenAt: questionsSchema.hiddenAt,
      deletedAt: questionsSchema.deletedAt,
      createdAt: questionsSchema.createdAt,
    });
    if (!row) throw new Error('Question was not persisted');

    return this.withQuestionAuthors({ ...row, tagSlugs: [], answers: [], author: null });
  }

  async list(input: ListQuestionsDTO): Promise<PaginatedQuestionsDTO> {
    const page = Math.max(1, Number(input.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(input.pageSize || 20)));
    const offset = (page - 1) * pageSize;
    const filters = [isNull(questionsSchema.hiddenAt), isNull(questionsSchema.deletedAt)];
    const tags = input.tags
      ? [
          ...new Set(
            input.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean),
          ),
        ]
      : [];
    if (tags.length) filters.push(this.buildTagPredicate(tags));
    if (input.search)
      filters.push(
        or(ilike(questionsSchema.title, `%${input.search}%`), ilike(questionsSchema.content, `%${input.search}%`))!,
      );
    if (input.status === 'open' || input.status === 'closed') filters.push(eq(questionsSchema.status, input.status));
    if (input.status === 'solved') filters.push(isNotNull(questionsSchema.acceptedAnswerId));
    const where = and(...filters);
    const answerCounts = this.db.$with('question_answer_counts').as(
      this.db
        .select({
          questionId: answersSchema.questionId,
          answerCount: count(answersSchema.id).as('answer_count'),
        })
        .from(answersSchema)
        .where(and(isNull(answersSchema.hiddenAt), isNull(answersSchema.deletedAt)))
        .groupBy(answersSchema.questionId),
    );
    const rowsQuery = this.db
      .with(answerCounts)
      .select({
        id: questionsSchema.id,
        authorAccountId: questionsSchema.authorAccountId,
        title: questionsSchema.title,
        status: questionsSchema.status,
        acceptedAnswerId: questionsSchema.acceptedAnswerId,
        createdAt: questionsSchema.createdAt,
        answerCount: sql<number>`coalesce(${answerCounts.answerCount}, 0)`,
        total: sql<number>`count(*) over()`,
      })
      .from(questionsSchema)
      .leftJoin(answerCounts, eq(answerCounts.questionId, questionsSchema.id))
      .where(where)
      .orderBy(
        input.sort === 'answers'
          ? desc(sql`coalesce(${answerCounts.answerCount}, 0)`)
          : desc(questionsSchema.createdAt),
      )
      .limit(pageSize)
      .offset(offset);
    const rows = await rowsQuery.$withCache({ config: { ex: 60 }, autoInvalidate: true });

    const tagsByResourceId = await this.getTagSlugsByResourceIds(rows.map((row) => row.id));

    return {
      items: await this.withQuestionItemAuthors(
        rows.map((row) => ({
          ...row,
          tagSlugs: tagsByResourceId[row.id] ?? [],
          answerCount: Number(row.answerCount),
          author: null,
        })),
      ),
      page,
      pageSize,
      total: Number(rows[0]?.total ?? 0),
    };
  }

  async search(criteria: QAndASearchCriteria): Promise<PaginatedQuestionsDTO> {
    const { tags, ...rest } = criteria;
    const input: ListQuestionsDTO = {
      ...rest,
      page: criteria.page ?? 1,
      pageSize: criteria.pageSize ?? 20,
    };
    if (tags?.length) input.tags = tags.join(',');

    return this.list(input);
  }

  async listPublicContributionsByAuthor(accountId: string, limit = 20): Promise<QAndAContributionRow[]> {
    const capped = Math.min(50, Math.max(1, limit));
    const [questions, answers] = await Promise.all([
      this.db
        .select({
          id: questionsSchema.id,
          questionId: questionsSchema.id,
          title: questionsSchema.title,
          createdAt: questionsSchema.createdAt,
          hiddenAt: questionsSchema.hiddenAt,
        })
        .from(questionsSchema)
        .where(and(eq(questionsSchema.authorAccountId, accountId), isNull(questionsSchema.hiddenAt)))
        .orderBy(desc(questionsSchema.createdAt))
        .limit(capped),
      this.db
        .select({
          id: answersSchema.id,
          questionId: answersSchema.questionId,
          title: questionsSchema.title,
          createdAt: answersSchema.createdAt,
          hiddenAt: answersSchema.hiddenAt,
        })
        .from(answersSchema)
        .innerJoin(questionsSchema, eq(questionsSchema.id, answersSchema.questionId))
        .where(
          and(
            eq(answersSchema.authorAccountId, accountId),
            isNull(answersSchema.hiddenAt),
            isNull(questionsSchema.hiddenAt),
            isNull(questionsSchema.deletedAt),
          ),
        )
        .orderBy(desc(answersSchema.createdAt))
        .limit(capped),
    ]);

    return [
      ...questions.map((item) => ({ ...item, kind: 'question' as const })),
      ...answers.map((item) => ({ ...item, kind: 'answer' as const })),
    ]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, capped);
  }

  async listContributionsByAuthor(accountId: string, limit = 20): Promise<QAndAContributionRow[]> {
    const capped = Math.min(50, Math.max(1, limit));
    const [questions, answers] = await Promise.all([
      this.db
        .select({
          id: questionsSchema.id,
          questionId: questionsSchema.id,
          title: questionsSchema.title,
          createdAt: questionsSchema.createdAt,
          hiddenAt: questionsSchema.hiddenAt,
        })
        .from(questionsSchema)
        .where(and(eq(questionsSchema.authorAccountId, accountId), isNull(questionsSchema.deletedAt)))
        .orderBy(desc(questionsSchema.createdAt))
        .limit(capped),
      this.db
        .select({
          id: answersSchema.id,
          questionId: answersSchema.questionId,
          title: questionsSchema.title,
          createdAt: answersSchema.createdAt,
          hiddenAt: answersSchema.hiddenAt,
        })
        .from(answersSchema)
        .innerJoin(questionsSchema, eq(questionsSchema.id, answersSchema.questionId))
        .where(
          and(
            eq(answersSchema.authorAccountId, accountId),
            isNull(answersSchema.deletedAt),
            isNull(questionsSchema.deletedAt),
          ),
        )
        .orderBy(desc(answersSchema.createdAt))
        .limit(capped),
    ]);

    return [
      ...questions.map((item) => ({ ...item, kind: 'question' as const })),
      ...answers.map((item) => ({ ...item, kind: 'answer' as const })),
    ]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, capped);
  }

  async getQuestion(id: string, viewer?: QAndAViewer): Promise<QuestionDTO | null> {
    const canSeeHiddenQuestion = viewer?.role === Role.MODERATOR || viewer?.role === Role.ADMIN;
    const [question] = await this.db
      .select({
        id: questionsSchema.id,
        authorAccountId: questionsSchema.authorAccountId,
        title: questionsSchema.title,
        content: questionsSchema.content,
        status: questionsSchema.status,
        acceptedAnswerId: questionsSchema.acceptedAnswerId,
        hiddenAt: questionsSchema.hiddenAt,
        deletedAt: questionsSchema.deletedAt,
        createdAt: questionsSchema.createdAt,
      })
      .from(questionsSchema)
      .where(
        and(
          eq(questionsSchema.id, id),
          isNull(questionsSchema.deletedAt),
          viewer
            ? canSeeHiddenQuestion
              ? undefined
              : or(isNull(questionsSchema.hiddenAt), eq(questionsSchema.authorAccountId, viewer.sub))
            : isNull(questionsSchema.hiddenAt),
        ),
      );
    if (!question) return null;
    const canSeeHiddenAnswers = canSeeHiddenQuestion || Boolean(viewer && viewer.sub === question.authorAccountId);
    const answers = await this.db
      .select({
        id: answersSchema.id,
        questionId: answersSchema.questionId,
        authorAccountId: answersSchema.authorAccountId,
        content: answersSchema.content,
        acceptedAt: answersSchema.acceptedAt,
        hiddenAt: answersSchema.hiddenAt,
        deletedAt: answersSchema.deletedAt,
        createdAt: answersSchema.createdAt,
        votes: sql<number>`coalesce(${voteStatisticsSchema.voteCount}, 0)`,
      })
      .from(answersSchema)
      .leftJoin(voteStatisticsSchema, eq(voteStatisticsSchema.resourceId, answersSchema.id))
      .where(
        and(
          eq(answersSchema.questionId, id),
          isNull(answersSchema.deletedAt),
          viewer
            ? canSeeHiddenAnswers
              ? undefined
              : or(isNull(answersSchema.hiddenAt), eq(answersSchema.authorAccountId, viewer.sub))
            : isNull(answersSchema.hiddenAt),
        ),
      )
      .orderBy(asc(answersSchema.createdAt));

    const tagSlugs = (await this.getTagSlugsByResourceIds([id]))[id] ?? [];

    return this.withQuestionAuthors({
      ...question,
      tagSlugs,
      author: null,
      answers: answers.map((answer) => ({ ...answer, votes: Number(answer.votes), author: null })),
    });
  }

  async findQuestion(id: string, viewer?: QAndAViewer): Promise<QuestionDTO | null> {
    return this.getQuestion(id, viewer);
  }

  async getAnswer(id: string, viewer?: QAndAViewer): Promise<AnswerDTO | null> {
    const [answer] = await this.db
      .select({
        id: answersSchema.id,
        questionId: answersSchema.questionId,
        authorAccountId: answersSchema.authorAccountId,
        content: answersSchema.content,
        acceptedAt: answersSchema.acceptedAt,
        hiddenAt: answersSchema.hiddenAt,
        deletedAt: answersSchema.deletedAt,
        createdAt: answersSchema.createdAt,
        votes: sql<number>`coalesce(${voteStatisticsSchema.voteCount}, 0)`,
      })
      .from(answersSchema)
      .leftJoin(voteStatisticsSchema, eq(voteStatisticsSchema.resourceId, answersSchema.id))
      .where(
        and(
          eq(answersSchema.id, id),
          isNull(answersSchema.deletedAt),
          viewer
            ? viewer.role === Role.MODERATOR || viewer.role === Role.ADMIN
              ? undefined
              : or(isNull(answersSchema.hiddenAt), eq(answersSchema.authorAccountId, viewer.sub))
            : isNull(answersSchema.hiddenAt),
        ),
      );

    return answer ? this.withAnswerAuthor({ ...answer, votes: Number(answer.votes), author: null }) : null;
  }

  async findAnswer(id: string, viewer?: QAndAViewer): Promise<AnswerDTO | null> {
    return this.getAnswer(id, viewer);
  }

  async createAnswer(
    id: string,
    questionId: string,
    authorAccountId: string,
    content: string,
    context?: unknown,
  ): Promise<AnswerDTO>;
  async createAnswer(questionId: string, authorAccountId: string, content: string): Promise<AnswerDTO>;
  async createAnswer(
    idOrQuestionId: string,
    questionIdOrAuthorAccountId: string,
    authorAccountIdOrContent: string,
    contentOrContext?: unknown,
    context?: unknown,
  ): Promise<AnswerDTO> {
    const legacySignature = contentOrContext === undefined;
    let id = legacySignature ? randomUUID() : idOrQuestionId;
    const questionId = legacySignature ? idOrQuestionId : questionIdOrAuthorAccountId;
    const authorAccountId = legacySignature ? questionIdOrAuthorAccountId : authorAccountIdOrContent;
    const content = legacySignature ? authorAccountIdOrContent : (contentOrContext as string);
    const transactionContext = legacySignature ? undefined : context;
    const persist = async (executor: Executor) => {
      const [question] = await executor
        .select({ status: questionsSchema.status })
        .from(questionsSchema)
        .where(
          and(eq(questionsSchema.id, questionId), isNull(questionsSchema.hiddenAt), isNull(questionsSchema.deletedAt)),
        )
        .for('update');
      if (!question) throw new Error('QUESTION_NOT_FOUND');
      if (question.status === 'closed') throw new Error('QUESTION_CLOSED');
      if (legacySignature) id = (await this.resources.create('answer', executor)).id;
      await this.resources.assertKind(id, 'answer', executor);
      const answer = Answer.create({ id, questionId, authorAccountId, content });
      const [persisted] = await executor.insert(answersSchema).values(answer.value).returning({
        id: answersSchema.id,
        questionId: answersSchema.questionId,
        authorAccountId: answersSchema.authorAccountId,
        content: answersSchema.content,
        acceptedAt: answersSchema.acceptedAt,
        hiddenAt: answersSchema.hiddenAt,
        deletedAt: answersSchema.deletedAt,
        createdAt: answersSchema.createdAt,
      });

      return persisted;
    };
    const answer = transactionContext
      ? await persist(transactionContext as Executor)
      : await this.db.transaction(persist);
    if (!answer) throw new Error('Answer was not persisted');

    return this.withAnswerAuthor({ ...answer, votes: 0, author: null });
  }

  async acceptAnswer(id: string, authorAccountId: string, answerId: string): Promise<QuestionDTO | null> {
    const updated = await this.db.transaction(async (tx) => {
      const [question] = await tx
        .select()
        .from(questionsSchema)
        .where(and(eq(questionsSchema.id, id), isNull(questionsSchema.hiddenAt), isNull(questionsSchema.deletedAt)))
        .for('update');
      if (!question || question.authorAccountId !== authorAccountId) return null;
      const [answer] = await tx
        .select()
        .from(answersSchema)
        .where(and(eq(answersSchema.id, answerId), isNull(answersSchema.hiddenAt), isNull(answersSchema.deletedAt)));
      if (!answer || answer.questionId !== id) return null;
      const now = new Date().toISOString();
      const questionAggregate = Question.rehydrate(question);
      const answerAggregate = Answer.rehydrate(answer);
      if (questionAggregate.value.acceptedAnswerId && questionAggregate.value.acceptedAnswerId !== answerId) {
        const [previous] = await tx
          .select()
          .from(answersSchema)
          .where(eq(answersSchema.id, questionAggregate.value.acceptedAnswerId))
          .limit(1);
        if (!previous) return null;
        questionAggregate.replaceAcceptedAnswer(Answer.rehydrate(previous), answerAggregate, new Date(now));
      } else {
        questionAggregate.acceptAnswer(answerAggregate, new Date(now));
      }
      await tx
        .update(answersSchema)
        .set({ acceptedAt: null })
        .where(and(eq(answersSchema.questionId, id), isNull(answersSchema.deletedAt)));
      await tx.update(answersSchema).set({ acceptedAt: now }).where(eq(answersSchema.id, answerId));
      const [row] = await tx
        .update(questionsSchema)
        .set({ acceptedAnswerId: answerId })
        .where(eq(questionsSchema.id, id))
        .returning({ id: questionsSchema.id });

      return row ?? null;
    });

    return updated ? this.getQuestion(id) : null;
  }

  async removeAcceptedAnswer(id: string, authorAccountId: string): Promise<QuestionDTO | null> {
    const updated = await this.db.transaction(async (tx) => {
      const [question] = await tx
        .select()
        .from(questionsSchema)
        .where(
          and(
            eq(questionsSchema.id, id),
            eq(questionsSchema.authorAccountId, authorAccountId),
            isNull(questionsSchema.deletedAt),
          ),
        )
        .for('update');
      if (!question || !question.acceptedAnswerId) return null;
      const [answer] = await tx
        .select()
        .from(answersSchema)
        .where(eq(answersSchema.id, question.acceptedAnswerId))
        .limit(1);
      if (!answer) return null;
      const questionAggregate = Question.rehydrate(question);
      const answerAggregate = Answer.rehydrate(answer);
      questionAggregate.removeAcceptedAnswer(answerAggregate);
      const [row] = await tx
        .update(questionsSchema)
        .set({ acceptedAnswerId: questionAggregate.value.acceptedAnswerId })
        .where(eq(questionsSchema.id, id))
        .returning({ id: questionsSchema.id });
      await tx
        .update(answersSchema)
        .set({ acceptedAt: answerAggregate.value.acceptedAt })
        .where(eq(answersSchema.id, answer.id));

      return row ?? null;
    });

    return updated ? this.getQuestion(id) : null;
  }

  async closeQuestion(id: string): Promise<QuestionDTO | null> {
    const [current] = await this.db
      .select()
      .from(questionsSchema)
      .where(and(eq(questionsSchema.id, id), isNull(questionsSchema.deletedAt)))
      .limit(1);
    if (!current) return null;
    const question = Question.rehydrate(current);
    question.close();
    const [row] = await this.db
      .update(questionsSchema)
      .set({ status: question.value.status })
      .where(and(eq(questionsSchema.id, id), isNull(questionsSchema.deletedAt)))
      .returning({ id: questionsSchema.id });

    return row ? this.getQuestion(id) : null;
  }

  async reopenQuestion(id: string): Promise<QuestionDTO | null> {
    const [current] = await this.db
      .select()
      .from(questionsSchema)
      .where(and(eq(questionsSchema.id, id), isNull(questionsSchema.deletedAt)))
      .limit(1);
    if (!current) return null;
    const question = Question.rehydrate(current);
    question.reopen();
    const [row] = await this.db
      .update(questionsSchema)
      .set({ status: question.value.status })
      .where(and(eq(questionsSchema.id, id), isNull(questionsSchema.deletedAt)))
      .returning({ id: questionsSchema.id });

    return row ? this.getQuestion(id) : null;
  }

  async deleteQuestion(id: string, accountId: string, isAdministrator: boolean): Promise<boolean> {
    const where = isAdministrator
      ? eq(questionsSchema.id, id)
      : and(eq(questionsSchema.id, id), eq(questionsSchema.authorAccountId, accountId));
    const [current] = await this.db
      .select()
      .from(questionsSchema)
      .where(and(where, isNull(questionsSchema.deletedAt)))
      .limit(1);
    if (!current) return false;
    const question = Question.rehydrate(current);
    question.delete();
    const [row] = await this.db
      .update(questionsSchema)
      .set({ deletedAt: question.value.deletedAt, acceptedAnswerId: question.value.acceptedAnswerId })
      .where(and(where, isNull(questionsSchema.deletedAt)))
      .returning({ id: questionsSchema.id });

    return Boolean(row);
  }

  async deleteAnswer(
    questionId: string,
    answerId: string,
    accountId: string,
    isAdministrator: boolean,
  ): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const where = isAdministrator
        ? and(eq(answersSchema.id, answerId), eq(answersSchema.questionId, questionId))
        : and(
            eq(answersSchema.id, answerId),
            eq(answersSchema.questionId, questionId),
            eq(answersSchema.authorAccountId, accountId),
          );
      const [answer] = await tx
        .select()
        .from(answersSchema)
        .where(and(where, isNull(answersSchema.deletedAt)))
        .for('update');
      if (!answer) return false;
      const [question] = await tx.select().from(questionsSchema).where(eq(questionsSchema.id, questionId)).limit(1);
      if (!question) return false;
      const questionAggregate = Question.rehydrate(question);
      const answerAggregate = Answer.rehydrate(answer);
      questionAggregate.deleteAnswer(answerAggregate);
      await tx
        .update(answersSchema)
        .set({ deletedAt: answerAggregate.value.deletedAt, acceptedAt: answerAggregate.value.acceptedAt })
        .where(eq(answersSchema.id, answerId));
      await tx
        .update(questionsSchema)
        .set({ acceptedAnswerId: questionAggregate.value.acceptedAnswerId })
        .where(and(eq(questionsSchema.id, questionId), eq(questionsSchema.acceptedAnswerId, answerId)));

      return true;
    });
  }

  async anonymizeAuthor(accountId: string): Promise<{ questions: number; answers: number }> {
    return this.db.transaction(async (tx) => {
      const questions = await tx
        .update(questionsSchema)
        .set({ authorAccountId: null })
        .where(eq(questionsSchema.authorAccountId, accountId))
        .returning({ id: questionsSchema.id });
      const answers = await tx
        .update(answersSchema)
        .set({ authorAccountId: null })
        .where(eq(answersSchema.authorAccountId, accountId))
        .returning({ id: answersSchema.id });

      return { questions: questions.length, answers: answers.length };
    });
  }

  private buildTagPredicate(tagSlugs: string[]) {
    const matchingQuestionIds = this.db
      .select({ resourceId: resourceTagAssignmentsSchema.resourceId })
      .from(resourceTagAssignmentsSchema)
      .innerJoin(
        tagsSchema,
        and(eq(tagsSchema.id, resourceTagAssignmentsSchema.tagId), eq(tagsSchema.status, 'active')),
      )
      .where(inArray(tagsSchema.slug, tagSlugs))
      .groupBy(resourceTagAssignmentsSchema.resourceId)
      .having(eq(countDistinct(tagsSchema.slug), tagSlugs.length));

    return inArray(questionsSchema.id, matchingQuestionIds);
  }

  private async getTagSlugsByResourceIds(resourceIds: string[]): Promise<Record<string, string[]>> {
    const uniqueIds = [...new Set(resourceIds)].filter(Boolean);
    if (!uniqueIds.length) return {};

    const rows = await this.db
      .select({ resourceId: resourceTagAssignmentsSchema.resourceId, slug: tagsSchema.slug })
      .from(resourceTagAssignmentsSchema)
      .innerJoin(tagsSchema, eq(tagsSchema.id, resourceTagAssignmentsSchema.tagId))
      .where(and(inArray(resourceTagAssignmentsSchema.resourceId, uniqueIds), eq(tagsSchema.status, 'active')))
      .orderBy(asc(tagsSchema.slug));

    return rows.reduce<Record<string, string[]>>((acc, row) => {
      (acc[row.resourceId] ??= []).push(row.slug);

      return acc;
    }, {});
  }

  private async profileFor(accountId: string | null) {
    if (!accountId) return null;
    const profiles = await this.profiles.getProfilesByAccountIds([accountId]);
    const profile = profiles[accountId];

    return profile
      ? { username: profile.username, displayName: profile.displayName, avatarUrl: profile.avatarUrl }
      : null;
  }

  private async withQuestionItemAuthors<T extends { authorAccountId: string | null }>(items: T[]) {
    const profiles = await this.profiles.getProfilesByAccountIds([
      ...new Set(items.map((item) => item.authorAccountId).filter((id): id is string => Boolean(id))),
    ]);

    return items.map((item) => ({
      ...item,
      author: item.authorAccountId
        ? (() => {
            const profile = profiles[item.authorAccountId];

            return profile
              ? { username: profile.username, displayName: profile.displayName, avatarUrl: profile.avatarUrl }
              : null;
          })()
        : null,
    }));
  }

  private async withAnswerAuthor(answer: AnswerDTO): Promise<AnswerDTO> {
    return { ...answer, author: await this.profileFor(answer.authorAccountId) };
  }

  private async withQuestionAuthors(question: QuestionDTO): Promise<QuestionDTO> {
    const accountIds = [
      ...new Set(
        [question.authorAccountId, ...question.answers.map((answer) => answer.authorAccountId)].filter(
          (id): id is string => Boolean(id),
        ),
      ),
    ];
    const profiles = await this.profiles.getProfilesByAccountIds(accountIds);
    const profileFor = (accountId: string | null) => {
      if (!accountId) return null;
      const profile = profiles[accountId];

      return profile
        ? { username: profile.username, displayName: profile.displayName, avatarUrl: profile.avatarUrl }
        : null;
    };

    return {
      ...question,
      author: profileFor(question.authorAccountId),
      answers: question.answers.map((answer) => ({ ...answer, author: profileFor(answer.authorAccountId) })),
    };
  }

  async moderateTarget(id: string, action: 'hide' | 'restore'): Promise<boolean> {
    const now = new Date().toISOString();
    const [question] = await this.db.select().from(questionsSchema).where(eq(questionsSchema.id, id)).limit(1);
    if (question) {
      const aggregate = Question.rehydrate(question);
      if (action === 'hide') aggregate.hide(new Date(now));
      else aggregate.unhide();
      const rows = await this.db
        .update(questionsSchema)
        .set({ hiddenAt: aggregate.value.hiddenAt })
        .where(eq(questionsSchema.id, id))
        .returning({ id: questionsSchema.id });

      return rows.length > 0;
    }
    if (action === 'hide') {
      const [accepted] = await this.db
        .select()
        .from(answersSchema)
        .where(and(eq(answersSchema.id, id), isNull(answersSchema.deletedAt)));
      if (accepted) {
        await this.db.transaction(async (tx) => {
          const [question] = await tx
            .select()
            .from(questionsSchema)
            .where(eq(questionsSchema.id, accepted.questionId))
            .limit(1);
          if (!question) return;
          const questionAggregate = Question.rehydrate(question);
          const answerAggregate = Answer.rehydrate(accepted);
          questionAggregate.hideAnswer(answerAggregate, new Date(now));
          await tx
            .update(answersSchema)
            .set({ hiddenAt: answerAggregate.value.hiddenAt, acceptedAt: answerAggregate.value.acceptedAt })
            .where(eq(answersSchema.id, id));
          await tx
            .update(questionsSchema)
            .set({ acceptedAnswerId: questionAggregate.value.acceptedAnswerId })
            .where(eq(questionsSchema.id, accepted.questionId));
        });

        return true;
      }
    }
    const [answer] = await this.db.select().from(answersSchema).where(eq(answersSchema.id, id)).limit(1);
    if (!answer) return false;
    const answerAggregate = Answer.rehydrate(answer);
    if (action === 'hide') answerAggregate.hide(new Date(now));
    else answerAggregate.unhide();
    const answers = await this.db
      .update(answersSchema)
      .set({ hiddenAt: answerAggregate.value.hiddenAt, acceptedAt: answerAggregate.value.acceptedAt })
      .where(eq(answersSchema.id, id))
      .returning({ id: answersSchema.id });

    return answers.length > 0;
  }

  async listHiddenForModeration(): Promise<Array<{ id: string; kind: 'question' | 'answer'; hiddenAt: string }>> {
    const [questions, answers] = await Promise.all([
      this.db
        .select({ id: questionsSchema.id, hiddenAt: questionsSchema.hiddenAt })
        .from(questionsSchema)
        .where(and(isNotNull(questionsSchema.hiddenAt), isNull(questionsSchema.deletedAt))),
      this.db
        .select({ id: answersSchema.id, hiddenAt: answersSchema.hiddenAt })
        .from(answersSchema)
        .where(and(isNotNull(answersSchema.hiddenAt), isNull(answersSchema.deletedAt))),
    ]);

    return [
      ...questions.flatMap((row) =>
        row.hiddenAt ? [{ id: row.id, kind: 'question' as const, hiddenAt: row.hiddenAt }] : [],
      ),
      ...answers.flatMap((row) =>
        row.hiddenAt ? [{ id: row.id, kind: 'answer' as const, hiddenAt: row.hiddenAt }] : [],
      ),
    ];
  }

  async resolveTarget(id: string): Promise<{ type: 'question' | 'answer'; isPublic: boolean } | null> {
    const [question] = await this.db
      .select({ id: questionsSchema.id, hiddenAt: questionsSchema.hiddenAt })
      .from(questionsSchema)
      .where(eq(questionsSchema.id, id));
    if (question) return { type: 'question', isPublic: question.hiddenAt === null };
    const [answer] = await this.db
      .select({ id: answersSchema.id, hiddenAt: answersSchema.hiddenAt })
      .from(answersSchema)
      .where(eq(answersSchema.id, id));

    return answer ? { type: 'answer', isPublic: answer.hiddenAt === null } : null;
  }
}
