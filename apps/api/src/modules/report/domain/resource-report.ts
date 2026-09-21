import { DomainError } from '@/shared/errors/domain-error';

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export type ResourceReportState = {
  id: string;
  resourceId: string;
  reporterAccountId: string | null;
  reason: string;
  description: string | null;
  status: ReportStatus;
  reviewedByAccountId: string | null;
  decisionNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export class ResourceReport {
  private constructor(private readonly state: ResourceReportState) {}

  static create(
    id: string,
    input: Pick<ResourceReportState, 'resourceId' | 'reason' | 'description'> & { reporterAccountId: string },
    at = new Date(),
  ): ResourceReport {
    ResourceReport.validateInput(input.resourceId, input.reporterAccountId, input.reason);

    return new ResourceReport({
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

  static rehydrate(state: ResourceReportState): ResourceReport {
    return new ResourceReport({ ...state });
  }
  get value(): ResourceReportState {
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
    if (this.state.status !== 'pending') throw new DomainError('RESOURCE_REPORT_INVALID_STATUS');
    if (!reviewerId.trim()) throw new DomainError('RESOURCE_REPORT_INVALID_REVIEWER');
    this.state.status = status;
    this.state.reviewedByAccountId = reviewerId;
    this.state.decisionNote = note?.trim() || null;
    this.state.reviewedAt = at.toISOString();
  }

  private static validateInput(resourceId: string, reporterId: string, reason: string): void {
    if (!resourceId.trim() || !reporterId.trim() || !reason.trim())
      throw new DomainError('RESOURCE_REPORT_INVALID_INPUT');
  }
}
