import { and, asc, count as drizzleCount, eq } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { externalResourceSuggestionsSchema } from '@/shared/infrastructure/database/drizzle/schema/external-resource/external-resources.schema';
import { ExternalResourceSuggestionRepository } from '@/modules/external-resource/application/ports/repositories/external-resource-suggestion.repository';
import {
  ExternalResourceSuggestion,
  ExternalResourceSuggestionStatus,
} from '@/modules/external-resource/domain/external-resource-suggestion';

type DrizzleTransaction = Parameters<DrizzleDatabaseService['transaction']>[0] extends (tx: infer T) => unknown
  ? T
  : never;
type Executor = DrizzleDatabaseService | DrizzleTransaction;

@Injectable()
export class DrizzleExternalResourceSuggestionRepository implements ExternalResourceSuggestionRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}
  async create(s: ExternalResourceSuggestion, context?: unknown): Promise<string> {
    const [row] = await ((context as Executor | undefined) ?? this.db)
      .insert(externalResourceSuggestionsSchema)
      .values({
        id: s.id === '__new__' ? undefined : s.id,
        acceptedExternalResourceId: s.acceptedExternalResourceId,
        submittedByAccountId:
          s.submittedByAccountId ??
          (() => {
            throw new Error('Resource suggestion requires submitter');
          })(),
        url: s.url,
        status: s.status,
        decisionNote: s.decisionNote,
        decidedByAccountId: s.decidedByAccountId,
        decidedAt: s.decidedAt,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })
      .returning({ id: externalResourceSuggestionsSchema.id });
    if (!row) throw new Error('Failed to persist ExternalResourceSuggestion');

    return row.id;
  }
  async findById(id: string, context?: unknown): Promise<ExternalResourceSuggestion | null> {
    const [row] = await ((context as Executor | undefined) ?? this.db)
      .select()
      .from(externalResourceSuggestionsSchema)
      .where(eq(externalResourceSuggestionsSchema.id, id));

    return row ? this.entity(row) : null;
  }
  async listPending(query: { page?: number; pageSize?: number; search?: string }) {
    const page = Math.max(1, query.page ?? 1),
      pageSize = Math.max(1, query.pageSize ?? 20);
    const where = and(
      eq(externalResourceSuggestionsSchema.status, ExternalResourceSuggestionStatus.Pending),
      undefined,
    );
    const items = await this.db
      .select()
      .from(externalResourceSuggestionsSchema)
      .where(where)
      .orderBy(asc(externalResourceSuggestionsSchema.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    const [count] = await this.db
      .select({ count: drizzleCount() })
      .from(externalResourceSuggestionsSchema)
      .where(where);

    return { items: items.map((r) => this.entity(r)), page, pageSize, total: Number(count?.count ?? 0) };
  }
  async listBySubmitter(accountId: string, query: { page?: number; pageSize?: number }) {
    const page = Math.max(1, query.page ?? 1),
      pageSize = Math.max(1, query.pageSize ?? 20);
    const where = eq(externalResourceSuggestionsSchema.submittedByAccountId, accountId);
    const items = await this.db
      .select()
      .from(externalResourceSuggestionsSchema)
      .where(where)
      .orderBy(asc(externalResourceSuggestionsSchema.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    const [count] = await this.db
      .select({ count: drizzleCount() })
      .from(externalResourceSuggestionsSchema)
      .where(where);

    return { items: items.map((r) => this.entity(r)), page, pageSize, total: Number(count?.count ?? 0) };
  }
  async save(
    s: ExternalResourceSuggestion,
    expected?: ExternalResourceSuggestionStatus,
    context?: unknown,
  ): Promise<boolean> {
    const conditions = [
      eq(externalResourceSuggestionsSchema.id, s.id),
      expected ? eq(externalResourceSuggestionsSchema.status, expected) : undefined,
    ].filter(Boolean);
    const rows = await ((context as Executor | undefined) ?? this.db)
      .update(externalResourceSuggestionsSchema)
      .set({
        acceptedExternalResourceId: s.acceptedExternalResourceId,
        status: s.status,
        decisionNote: s.decisionNote,
        decidedByAccountId: s.decidedByAccountId,
        decidedAt: s.decidedAt,
        updatedAt: s.updatedAt,
      })
      .where(and(...conditions))
      .returning({ id: externalResourceSuggestionsSchema.id });

    return rows.length > 0;
  }
  private entity(r: typeof externalResourceSuggestionsSchema.$inferSelect) {
    return ExternalResourceSuggestion.rehydrate({
      id: r.id,
      acceptedExternalResourceId: r.acceptedExternalResourceId,
      submittedByAccountId: r.submittedByAccountId,
      url: r.url,
      status: r.status as ExternalResourceSuggestionStatus,
      decisionNote: r.decisionNote,
      decidedByAccountId: r.decidedByAccountId,
      decidedAt: r.decidedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }
}
