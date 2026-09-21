import { DomainError } from '@/shared/errors/domain-error';
import type { ReportStatus } from './resource-report';

export type CommentReportState = {
  id: string;
  commentId: string;
  reporterAccountId: string | null;
  reason: string;
  description: string | null;
  status: ReportStatus;
  reviewedByAccountId: string | null;
  decisionNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export class CommentReport {
  private constructor(private readonly state: CommentReportState) {}

  static create(
    id: string,
    input: Pick<CommentReportState, 'commentId' | 'reason' | 'description'> & { reporterAccountId: string },
    at = new Date(),
  ): CommentReport {
    if (!input.commentId.trim() || !input.reporterAccountId.trim() || !input.reason.trim())
      throw new DomainError('COMMENT_REPORT_INVALID_INPUT');

    return new CommentReport({
      id,
      ...input,
      reason: input.reason.trim(),
      description: input.description?.trim() || null,
      status: 'pending',
      reviewedByAccountId: null,
      decisionNote: null,
      createdAt: at.toISOString(),
      reviewedAt: null,
    });
  }

  static rehydrate(state: CommentReportState): CommentReport {
    return new CommentReport({ ...state });
  }
  get value(): CommentReportState {
    return { ...this.state };
  }

  resolve(reviewerId: string, note?: string, at = new Date()): void {
    this.review('resolved', reviewerId, note, at);
  }
  dismiss(reviewerId: string, note?: string, at = new Date()): void {
    this.review('dismissed', reviewerId, note, at);
  }

  private review(
    status: Exclude<ReportStatus, 'pending'>,
    reviewerId: string,
    note: string | undefined,
    at: Date,
  ): void {
    if (this.state.status !== 'pending') throw new DomainError('COMMENT_REPORT_INVALID_STATUS');
    if (!reviewerId.trim()) throw new DomainError('COMMENT_REPORT_INVALID_REVIEWER');
    this.state.status = status;
    this.state.reviewedByAccountId = reviewerId;
    this.state.decisionNote = note?.trim() || null;
    this.state.reviewedAt = at.toISOString();
  }
}
