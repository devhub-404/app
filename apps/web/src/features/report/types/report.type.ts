import type { components } from '@devhub-404/api-contract';

export const REPORT_STATUSES = ['pending', 'resolved', 'dismissed'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];
export type ReportDecision = components['schemas']['ReviewReportDTO']['decision'];
export type ReportKind = 'resource' | 'comment';

export type CreateResourceReportInput = components['schemas']['CreateResourceReportDTO'];
export type CreateCommentReportInput = components['schemas']['CreateCommentReportDTO'];
export type CreateReportInput = CreateResourceReportInput & CreateCommentReportInput;
export type ReviewReportInput = components['schemas']['ReviewReportDTO'];

export type ReportItem = {
  id: string;
  kind: ReportKind;
  targetId?: string;
  targetLabel?: string;
  status: ReportStatus;
  reason?: string;
  description?: string;
  reporterLabel?: string;
  reviewerLabel?: string;
  reviewNote?: string;
  createdAt?: string;
  reviewedAt?: string;
};
