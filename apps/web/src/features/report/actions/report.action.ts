import { ReportApi } from '@/features/report/api/report.api.ts';
import type {
  CreateReportInput,
  ReportItem,
  ReportKind,
  ReportStatus,
  ReviewReportInput,
} from '@/features/report/types/report.type.ts';
import { isClientAccessAllowed } from '@/features/auth/public/access';
import { canReviewReports } from '@/features/report/access/report.access.ts';

function stringField(value: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate;
  }
  return undefined;
}

function normalizeStatus(value: unknown): ReportStatus {
  return value === 'resolved' || value === 'dismissed' ? value : 'pending';
}

function normalizeReports(input: unknown, kind: ReportKind): ReportItem[] {
  const payload = input && typeof input === 'object' && 'data' in input ? (input as { data?: unknown }).data : input;
  const source = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown[] }).items)
      ? (payload as { items: unknown[] }).items
      : [];

  return source.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return [];
    const value = entry as Record<string, unknown>;
    const id = stringField(value, 'id');
    if (!id) return [];

    const target =
      value['resource'] && typeof value['resource'] === 'object'
        ? (value['resource'] as Record<string, unknown>)
        : value['comment'] && typeof value['comment'] === 'object'
          ? (value['comment'] as Record<string, unknown>)
          : undefined;
    const reporter =
      value['reporter'] && typeof value['reporter'] === 'object'
        ? (value['reporter'] as Record<string, unknown>)
        : undefined;
    const reviewer =
      value['reviewer'] && typeof value['reviewer'] === 'object'
        ? (value['reviewer'] as Record<string, unknown>)
        : undefined;

    return [
      {
        id,
        kind,
        targetId: stringField(value, 'resourceId', 'commentId') ?? (target ? stringField(target, 'id') : undefined),
        targetLabel: target ? stringField(target, 'title', 'content', 'slug') : undefined,
        status: normalizeStatus(value['status']),
        reason: stringField(value, 'reason'),
        description: stringField(value, 'description'),
        reporterLabel: reporter
          ? stringField(reporter, 'displayName', 'username', 'email')
          : stringField(value, 'reporterUsername'),
        reviewerLabel: reviewer
          ? stringField(reviewer, 'displayName', 'username', 'email')
          : stringField(value, 'reviewerUsername'),
        reviewNote: stringField(value, 'reviewNote', 'note'),
        createdAt: stringField(value, 'createdAt'),
        reviewedAt: stringField(value, 'reviewedAt', 'resolvedAt'),
      },
    ];
  });
}

async function command(task: () => Promise<{ error?: unknown }>): Promise<boolean> {
  try {
    return !(await task()).error;
  } catch {
    return false;
  }
}

export const reportResource = (resourceId: string, input: CreateReportInput) =>
  command(() => ReportApi.reportResource(resourceId, input));

export const reportComment = (commentId: string, input: CreateReportInput) =>
  command(() => ReportApi.reportComment(commentId, input));

export async function listReports(status?: ReportStatus) {
  if (!isClientAccessAllowed(canReviewReports)) return { items: [], error: { code: 'AUTHORIZATION_REQUIRED' } };
  const [resources, comments] = await Promise.all([ReportApi.listResources(status), ReportApi.listComments(status)]);
  const items = [
    ...normalizeReports(resources.data?.data, 'resource'),
    ...normalizeReports(comments.data?.data, 'comment'),
  ].filter((item) => !status || item.status === status);

  return { items, error: resources.error ?? comments.error ?? null };
}

export function reviewReport(item: ReportItem, input: ReviewReportInput) {
  if (!isClientAccessAllowed(canReviewReports)) return Promise.resolve(false);
  return command(() =>
    item.kind === 'resource' ? ReportApi.reviewResource(item.id, input) : ReportApi.reviewComment(item.id, input),
  );
}
