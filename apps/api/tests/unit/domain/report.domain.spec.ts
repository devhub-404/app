import { describe, expect, it } from 'vitest';
import { CommentReport, ResourceReport, ResourceReportTargetPolicy } from '@/modules/report/domain';
import type { ResourceKind } from '@/shared/kernel/resource/resource-identity';

describe('Report domain', () => {
  it('RPT-RN-003 explicitly defines the server-owned Resource kinds accepted by the capability', () => {
    const kinds: ResourceKind[] = [
      'article',
      'news',
      'external_resource',
      'project',
      'event',
      'job',
      'question',
      'answer',
    ];
    for (const kind of kinds) expect(ResourceReportTargetPolicy.supports(kind)).toBe(true);
  });

  it('RPT-RN-005 — rehydrates preserved Report history after reporter Account purge', () => {
    const report = ResourceReport.rehydrate({
      id: 'report-1',
      resourceId: 'resource-1',
      reporterAccountId: null,
      reason: 'spam',
      description: null,
      status: 'resolved',
      reviewedByAccountId: null,
      decisionNote: 'done',
      createdAt: '2026-01-01T00:00:00.000Z',
      reviewedAt: '2026-01-02T00:00:00.000Z',
    });
    expect(report.value).toMatchObject({ reporterAccountId: null, status: 'resolved', resourceId: 'resource-1' });
  });

  it('RPT-RN-004 only allows a pending ResourceReport to receive one final decision', () => {
    const report = ResourceReport.create('report-1', {
      resourceId: 'resource-1',
      reporterAccountId: 'account-1',
      reason: 'reason',
      description: null,
    });
    report.resolve('reviewer-1', 'ok');
    expect(report.value.status).toBe('resolved');
    expect(() => report.dismiss('reviewer-2')).toThrow();
  });

  it('RPT-RN-004 only allows a pending CommentReport to receive one final decision', () => {
    const report = CommentReport.create('report-2', {
      commentId: 'comment-1',
      reporterAccountId: 'account-1',
      reason: 'reason',
      description: null,
    });
    report.dismiss('reviewer-1');
    expect(report.value.status).toBe('dismissed');
    expect(() => report.resolve('reviewer-2')).toThrow();
  });
});
