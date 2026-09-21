import { DomainError } from '@/shared/errors/domain-error';
import { canonicalizeHttpUrl, InvalidHttpUrlError } from '@/shared/kernel/url/canonical-http-url';

export enum ExternalResourceSuggestionStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
}

export interface ExternalResourceSuggestionProps {
  id: string;
  acceptedExternalResourceId: string | null;
  submittedByAccountId: string | null;
  url: string;
  status: ExternalResourceSuggestionStatus;
  decisionNote: string | null;
  decidedByAccountId: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

type CreateExternalResourceSuggestionProps = {
  url: string;
  submittedByAccountId: string;
  createdAt?: string;
};

export class ExternalResourceSuggestion {
  private constructor(private readonly props: ExternalResourceSuggestionProps) {}
  get id() {
    return this.props.id;
  }
  get acceptedExternalResourceId() {
    return this.props.acceptedExternalResourceId;
  }
  get submittedByAccountId() {
    return this.props.submittedByAccountId;
  }
  get url() {
    return this.props.url;
  }
  get status() {
    return this.props.status;
  }
  get decisionNote() {
    return this.props.decisionNote;
  }
  get decidedByAccountId() {
    return this.props.decidedByAccountId;
  }
  get decidedAt() {
    return this.props.decidedAt;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(id: string, props: CreateExternalResourceSuggestionProps) {
    const now = props.createdAt ?? new Date().toISOString();
    let url: string;
    try {
      url = canonicalizeHttpUrl(props.url);
    } catch (error) {
      if (error instanceof InvalidHttpUrlError) throw new DomainError('EXTERNAL_RESOURCE_INVALID_URL');

      throw error;
    }

    return new ExternalResourceSuggestion({
      id,
      acceptedExternalResourceId: null,
      submittedByAccountId: props.submittedByAccountId,
      url,
      status: ExternalResourceSuggestionStatus.Pending,
      decisionNote: null,
      decidedByAccountId: null,
      decidedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: ExternalResourceSuggestionProps) {
    return new ExternalResourceSuggestion(props);
  }

  approve(acceptedExternalResourceId: string, reviewerId: string) {
    this.decide(ExternalResourceSuggestionStatus.Accepted, reviewerId);
    this.props.acceptedExternalResourceId = acceptedExternalResourceId;
  }

  reject(reviewerId: string, note?: string) {
    this.decide(ExternalResourceSuggestionStatus.Rejected, reviewerId);
    this.props.decisionNote = note?.trim() || null;
  }

  private decide(status: ExternalResourceSuggestionStatus, reviewerId: string) {
    if (this.props.status !== ExternalResourceSuggestionStatus.Pending)
      throw new DomainError('EXTERNAL_RESOURCE_SUGGESTION_INVALID_STATUS');
    if (!reviewerId.trim()) throw new DomainError('EXTERNAL_RESOURCE_SUGGESTION_INVALID_REVIEWER');
    this.props.status = status;
    this.props.decidedByAccountId = reviewerId;
    this.props.decidedAt = new Date().toISOString();
    this.props.updatedAt = this.props.decidedAt;
  }
}
