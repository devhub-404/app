import { DomainError } from '@/shared/errors/domain-error';
import { canonicalizeHttpUrl, InvalidHttpUrlError } from '@/shared/kernel/url/canonical-http-url';

export type EventSuggestionStatus = 'pending' | 'accepted' | 'rejected';

export type EventSuggestionState = {
  id: string;
  url: string;
  submittedByAccountId: string | null;
  status: EventSuggestionStatus;
  acceptedEventId: string | null;
  decidedByAccountId: string | null;
  decisionNote: string | null;
  createdAt: string;
  decidedAt: string | null;
};

export class EventSuggestion {
  private constructor(private readonly state: EventSuggestionState) {}

  static rehydrate(state: EventSuggestionState): EventSuggestion {
    return new EventSuggestion({ ...state });
  }

  static create(id: string, url: string, submittedByAccountId: string, at = new Date()): EventSuggestion {
    if (!url || !submittedByAccountId) throw new DomainError('EVENT_SUGGESTION_REQUIRED_FIELDS');

    return new EventSuggestion({
      id,
      url: EventSuggestion.canonicalUrl(url),
      submittedByAccountId,
      status: 'pending',
      acceptedEventId: null,
      decidedByAccountId: null,
      decisionNote: null,
      createdAt: at.toISOString(),
      decidedAt: null,
    });
  }

  accept(eventId: string, decidedByAccountId: string, at = new Date()): void {
    this.ensurePending();
    if (!eventId || !decidedByAccountId) throw new DomainError('EVENT_SUGGESTION_REQUIRED_FIELDS');
    this.state.status = 'accepted';
    this.state.acceptedEventId = eventId;
    this.state.decidedByAccountId = decidedByAccountId;
    this.state.decisionNote = null;
    this.state.decidedAt = at.toISOString();
  }

  reject(decidedByAccountId: string, note?: string, at = new Date()): void {
    this.ensurePending();
    if (!decidedByAccountId) throw new DomainError('EVENT_SUGGESTION_REQUIRED_FIELDS');
    this.state.status = 'rejected';
    this.state.decidedByAccountId = decidedByAccountId;
    this.state.decisionNote = note?.trim() || null;
    this.state.decidedAt = at.toISOString();
  }

  snapshot(): EventSuggestionState {
    return { ...this.state };
  }

  private static canonicalUrl(value: string): string {
    try {
      return canonicalizeHttpUrl(value);
    } catch (error) {
      if (error instanceof InvalidHttpUrlError) throw new DomainError('EVENT_SUGGESTION_INVALID_URL');

      throw error;
    }
  }

  private ensurePending(): void {
    if (this.state.status !== 'pending') throw new DomainError('EVENT_SUGGESTION_INVALID_STATUS');
  }
}
