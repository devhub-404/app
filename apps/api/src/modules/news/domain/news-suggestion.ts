import { DomainError } from '@/shared/errors/domain-error';
import { canonicalizeHttpUrl, InvalidHttpUrlError } from '@/shared/kernel/url/canonical-http-url';

export enum NewsSuggestionStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

export interface NewsSuggestionProps {
  id: string;
  url: string;
  submittedByAccountId: string | null;
  status: NewsSuggestionStatus;
  acceptedNewsId: string | null;
  decidedByAccountId: string | null;
  decisionNote: string | null;
  createdAt: string;
  decidedAt: string | null;
}

export class NewsSuggestion {
  private constructor(private readonly props: NewsSuggestionProps) {}

  get id() {
    return this.props.id;
  }
  get url() {
    return this.props.url;
  }
  get submittedByAccountId() {
    return this.props.submittedByAccountId;
  }
  get status() {
    return this.props.status;
  }
  get acceptedNewsId() {
    return this.props.acceptedNewsId;
  }
  get decidedByAccountId() {
    return this.props.decidedByAccountId;
  }
  get decisionNote() {
    return this.props.decisionNote;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get decidedAt() {
    return this.props.decidedAt;
  }

  static create(id: string, url: string, submittedByAccountId: string, at = new Date()): NewsSuggestion {
    if (!submittedByAccountId.trim()) throw new DomainError('NEWS_SUGGESTION_INVALID_SUBMITTER');

    return new NewsSuggestion({
      id,
      url: NewsSuggestion.canonicalUrl(url),
      submittedByAccountId,
      status: NewsSuggestionStatus.Pending,
      acceptedNewsId: null,
      decidedByAccountId: null,
      decisionNote: null,
      createdAt: at.toISOString(),
      decidedAt: null,
    });
  }

  static rehydrate(props: NewsSuggestionProps) {
    return new NewsSuggestion({ ...props });
  }

  accept(newsId: string, reviewerId: string, at = new Date()): void {
    if (!newsId.trim()) throw new DomainError('NEWS_SUGGESTION_INVALID_NEWS');
    this.decide(NewsSuggestionStatus.Accepted, reviewerId, null, at);
    this.props.acceptedNewsId = newsId;
  }

  reject(reviewerId: string, note?: string, at = new Date()): void {
    this.decide(NewsSuggestionStatus.Rejected, reviewerId, note?.trim() || null, at);
  }

  private static canonicalUrl(value: string): string {
    try {
      return canonicalizeHttpUrl(value);
    } catch (error) {
      if (error instanceof InvalidHttpUrlError) throw new DomainError('NEWS_SUGGESTION_INVALID_URL');

      throw error;
    }
  }

  private decide(
    status: Exclude<NewsSuggestionStatus, NewsSuggestionStatus.Pending>,
    reviewerId: string,
    note: string | null,
    at: Date,
  ): void {
    if (this.props.status !== NewsSuggestionStatus.Pending) throw new DomainError('NEWS_SUGGESTION_INVALID_STATUS');
    if (!reviewerId.trim()) throw new DomainError('NEWS_SUGGESTION_INVALID_REVIEWER');
    this.props.status = status;
    this.props.decidedByAccountId = reviewerId;
    this.props.decisionNote = note;
    this.props.decidedAt = at.toISOString();
  }
}
