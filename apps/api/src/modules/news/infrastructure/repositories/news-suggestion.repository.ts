import { and, asc, eq } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { newsSuggestionsSchema } from '@/shared/infrastructure/database/drizzle/schema/news/news.schema';
import { NewsSuggestionRepository } from '@/modules/news/application/ports/repositories/news-suggestion.repository';
import { NewsSuggestion, NewsSuggestionStatus } from '@/modules/news/domain/news-suggestion';
type DrizzleTransaction = Parameters<DrizzleDatabaseService['transaction']>[0] extends (tx: infer T) => unknown
  ? T
  : never;
type Executor = DrizzleDatabaseService | DrizzleTransaction;
@Injectable()
export class DrizzleNewsSuggestionRepository implements NewsSuggestionRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}
  async create(v: NewsSuggestion) {
    const [row] = await this.db
      .insert(newsSuggestionsSchema)
      .values({
        id: v.id === '__new__' ? undefined : v.id,
        url: v.url,
        submittedByAccountId: v.submittedByAccountId,
        status: v.status,
        acceptedNewsId: v.acceptedNewsId,
        createdAt: v.createdAt,
        decidedByAccountId: v.decidedByAccountId,
        decisionNote: v.decisionNote,
        decidedAt: v.decidedAt,
      })
      .returning({ id: newsSuggestionsSchema.id });
    if (!row) throw new Error('News suggestion not persisted');

    return row.id;
  }
  async findById(id: string, context?: unknown) {
    const [r] = await ((context as Executor | undefined) ?? this.db)
      .select()
      .from(newsSuggestionsSchema)
      .where(eq(newsSuggestionsSchema.id, id));

    return r ? this.toEntity(r) : null;
  }
  async findPendingByUrl(url: string) {
    const [r] = await this.db.select().from(newsSuggestionsSchema).where(eq(newsSuggestionsSchema.url, url));

    return r?.status === 'pending' ? this.toEntity(r) : null;
  }
  async listPending() {
    const rows = await this.db
      .select()
      .from(newsSuggestionsSchema)
      .where(eq(newsSuggestionsSchema.status, 'pending'))
      .orderBy(asc(newsSuggestionsSchema.createdAt));

    return rows.map((row) => this.toEntity(row));
  }
  async listBySubmitter(accountId: string) {
    const rows = await this.db
      .select()
      .from(newsSuggestionsSchema)
      .where(eq(newsSuggestionsSchema.submittedByAccountId, accountId))
      .orderBy(asc(newsSuggestionsSchema.createdAt));

    return rows.map((row) => this.toEntity(row));
  }
  async save(v: NewsSuggestion, expected?: NewsSuggestionStatus, context?: unknown) {
    const rows = await ((context as Executor | undefined) ?? this.db)
      .update(newsSuggestionsSchema)
      .set({
        status: v.status,
        acceptedNewsId: v.acceptedNewsId,
        decidedByAccountId: v.decidedByAccountId,
        decisionNote: v.decisionNote,
        decidedAt: v.decidedAt,
      })
      .where(
        expected
          ? and(eq(newsSuggestionsSchema.id, v.id), eq(newsSuggestionsSchema.status, expected))
          : eq(newsSuggestionsSchema.id, v.id),
      )
      .returning({ id: newsSuggestionsSchema.id });

    return rows.length > 0;
  }
  private toEntity(r: typeof newsSuggestionsSchema.$inferSelect) {
    return NewsSuggestion.rehydrate({
      id: r.id,
      url: r.url,
      submittedByAccountId: r.submittedByAccountId,
      status: r.status as NewsSuggestionStatus,
      acceptedNewsId: r.acceptedNewsId,
      decidedByAccountId: r.decidedByAccountId,
      decisionNote: r.decisionNote,
      createdAt: r.createdAt,
      decidedAt: r.decidedAt,
    });
  }
}
