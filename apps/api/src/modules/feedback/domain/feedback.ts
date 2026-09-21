import { DomainError } from '@/shared/errors/domain-error';

export type FeedbackCategory = 'bug' | 'issue' | 'suggestion';
export type FeedbackStatus = 'open' | 'in_review' | 'resolved' | 'dismissed';
export type FeedbackState = {
  id: string;
  reporterAccountId: string | null;
  category: FeedbackCategory;
  description: string;
  contextUrl: string | null;
  screenshotMediaId: string | null;
  status: FeedbackStatus;
  internalSeverity: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

export class Feedback {
  private constructor(private readonly state: FeedbackState) {}
  static create(
    input: Omit<FeedbackState, 'status' | 'resolvedAt' | 'createdAt' | 'internalSeverity'>,
    at = new Date(),
  ): Feedback {
    if (
      !input.reporterAccountId ||
      !input.description.trim() ||
      !['bug', 'issue', 'suggestion'].includes(input.category)
    )
      throw new DomainError('FEEDBACK_INVALID_SUBMISSION');

    return new Feedback({
      ...input,
      status: 'open',
      internalSeverity: null,
      resolvedAt: null,
      createdAt: at.toISOString(),
    });
  }
  static rehydrate(state: FeedbackState): Feedback {
    return new Feedback({ ...state });
  }
  get value(): FeedbackState {
    return { ...this.state };
  }
  startReview(): void {
    if (this.state.status !== 'open') throw new DomainError('FEEDBACK_INVALID_STATUS');
    this.state.status = 'in_review';
  }
  resolve(at = new Date()): void {
    this.finish('resolved', at);
  }
  dismiss(at = new Date()): void {
    this.finish('dismissed', at);
  }
  classify(internalSeverity: string | null): void {
    if (this.state.status === 'resolved' || this.state.status === 'dismissed')
      throw new DomainError('FEEDBACK_INVALID_STATUS');
    this.state.internalSeverity = internalSeverity;
  }
  private finish(status: 'resolved' | 'dismissed', at: Date): void {
    if (this.state.status !== 'open' && this.state.status !== 'in_review')
      throw new DomainError('FEEDBACK_INVALID_STATUS');
    this.state.status = status;
    this.state.resolvedAt = at.toISOString();
  }
}
