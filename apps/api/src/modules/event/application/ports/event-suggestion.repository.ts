import type { EventSuggestion, EventSuggestionStatus } from '@/modules/event/domain/event-suggestion';

export abstract class EventSuggestionRepository {
  abstract create(suggestion: EventSuggestion, context?: unknown): Promise<void>;
  abstract findById(id: string, context?: unknown): Promise<EventSuggestion | null>;
  abstract save(
    suggestion: EventSuggestion,
    expectedStatus: EventSuggestionStatus,
    context?: unknown,
  ): Promise<boolean>;
  abstract listBySubmitter(accountId: string): Promise<EventSuggestion[]>;
  abstract listPending(): Promise<EventSuggestion[]>;
  abstract hasPendingUrl(url: string, context?: unknown): Promise<boolean>;
}
