import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { eventSuggestionsSchema } from '@/shared/infrastructure/database/drizzle/schema/event/events.schema';
import { EventSuggestion, type EventSuggestionStatus } from '@/modules/event/domain/event-suggestion';
import { EventSuggestionRepository } from '@/modules/event/application/ports/event-suggestion.repository';

type DrizzleTransaction = Parameters<DrizzleDatabaseService['transaction']>[0] extends (tx: infer T) => unknown
  ? T
  : never;
type Executor = DrizzleDatabaseService | DrizzleTransaction;

@Injectable()
export class DrizzleEventSuggestionRepository implements EventSuggestionRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}
  async create(suggestion: EventSuggestion, context?: unknown): Promise<void> {
    await ((context as Executor | undefined) ?? this.db).insert(eventSuggestionsSchema).values(suggestion.snapshot());
  }
  async findById(id: string, context?: unknown): Promise<EventSuggestion | null> {
    const [row] = await ((context as Executor | undefined) ?? this.db)
      .select()
      .from(eventSuggestionsSchema)
      .where(eq(eventSuggestionsSchema.id, id))
      .limit(1);

    return row ? EventSuggestion.rehydrate(row) : null;
  }
  async save(suggestion: EventSuggestion, expectedStatus: EventSuggestionStatus, context?: unknown): Promise<boolean> {
    const v = suggestion.snapshot();
    const rows = await ((context as Executor | undefined) ?? this.db)
      .update(eventSuggestionsSchema)
      .set({
        status: v.status,
        acceptedEventId: v.acceptedEventId,
        decidedByAccountId: v.decidedByAccountId,
        decisionNote: v.decisionNote,
        decidedAt: v.decidedAt,
      })
      .where(and(eq(eventSuggestionsSchema.id, v.id), eq(eventSuggestionsSchema.status, expectedStatus)))
      .returning({ id: eventSuggestionsSchema.id });

    return rows.length > 0;
  }
  async listBySubmitter(accountId: string): Promise<EventSuggestion[]> {
    const rows = await this.db
      .select()
      .from(eventSuggestionsSchema)
      .where(eq(eventSuggestionsSchema.submittedByAccountId, accountId))
      .orderBy(desc(eventSuggestionsSchema.createdAt));

    return rows.map((row) => EventSuggestion.rehydrate(row));
  }
  async listPending(): Promise<EventSuggestion[]> {
    const rows = await this.db
      .select()
      .from(eventSuggestionsSchema)
      .where(eq(eventSuggestionsSchema.status, 'pending'))
      .orderBy(desc(eventSuggestionsSchema.createdAt));

    return rows.map((row) => EventSuggestion.rehydrate(row));
  }
  async hasPendingUrl(url: string, context?: unknown): Promise<boolean> {
    const [row] = await ((context as Executor | undefined) ?? this.db)
      .select({ id: eventSuggestionsSchema.id })
      .from(eventSuggestionsSchema)
      .where(and(eq(eventSuggestionsSchema.url, url), eq(eventSuggestionsSchema.status, 'pending')))
      .limit(1);

    return Boolean(row);
  }
}
