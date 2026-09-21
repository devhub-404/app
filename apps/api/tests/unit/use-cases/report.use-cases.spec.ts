import { describe, expect, it, vi } from 'vitest';
import { CreateResourceReportCommand } from '@/modules/report/application/use-cases/create-resource-report.command';
import { CreateCommentReportCommand } from '@/modules/report/application/use-cases/create-comment-report.command';
import {
  ListCommentReportsQuery,
  ListResourceReportsQuery,
} from '@/modules/report/application/use-cases/list-reports.query';
import {
  ReviewCommentReportCommand,
  ReviewResourceReportCommand,
} from '@/modules/report/application/use-cases/review-report.command';
import { CommentReport, ResourceReport } from '@/modules/report/domain';

describe('Report use cases', () => {
  it('RPT-RF-001/RPT-RN-006 — creates a ResourceReport only after target reportability is established and does not moderate the target', async () => {
    const isReportable = vi.fn(async () => true);
    const createResource = vi.fn(async () => undefined);
    const command = new CreateResourceReportCommand({ isReportable } as never, { createResource } as never);

    await expect(command.execute({ accountId: 'account-1', resourceId: 'resource-1', reason: 'spam' })).resolves.toHaveProperty('id');
    expect(isReportable).toHaveBeenCalledWith('resource-1');
    expect(createResource).toHaveBeenCalledTimes(1);
    expect(createResource.mock.calls[0]?.[0].value).toMatchObject({
      resourceId: 'resource-1',
      reporterAccountId: 'account-1',
      reason: 'spam',
      status: 'pending',
    });

    await expect(
      new CreateResourceReportCommand(
        { isReportable: vi.fn(async () => false) } as never,
        { createResource } as never,
      ).execute({ accountId: 'account-1', resourceId: 'resource-x', reason: 'spam' }),
    ).rejects.toMatchObject({ code: 'CONTENT_NOT_FOUND' });
  });

  it('RPT-RF-002 — creates a CommentReport only for an existing Comment', async () => {
    const resolve = vi.fn(async () => ({ id: 'comment-1' }));
    const createComment = vi.fn(async () => undefined);
    await expect(
      new CreateCommentReportCommand({ resolve } as never, { createComment } as never).execute({
        accountId: 'account-1',
        commentId: 'comment-1',
        reason: 'abuse',
        description: 'details',
      }),
    ).resolves.toHaveProperty('id');
    expect(createComment.mock.calls[0]?.[0].value).toMatchObject({
      commentId: 'comment-1',
      reporterAccountId: 'account-1',
      reason: 'abuse',
      status: 'pending',
    });

    await expect(
      new CreateCommentReportCommand({ resolve: vi.fn(async () => null) } as never, { createComment } as never).execute(
        { accountId: 'account-1', commentId: 'missing', reason: 'abuse' },
      ),
    ).rejects.toMatchObject({ code: 'CONTENT_COMMENT_NOT_FOUND' });
  });

  it('RPT-RF-003 — lists ResourceReports and CommentReports with explicit status filtering', async () => {
    const resource = ResourceReport.create('rr-1', {
      resourceId: 'resource-1',
      reporterAccountId: 'account-1',
      reason: 'spam',
      description: null,
    });
    const comment = CommentReport.create('cr-1', {
      commentId: 'comment-1',
      reporterAccountId: 'account-1',
      reason: 'abuse',
      description: null,
    });
    const listResources = vi.fn(async () => [resource]);
    const listComments = vi.fn(async () => [comment]);
    const repository = { listResources, listComments } as never;

    await expect(new ListResourceReportsQuery(repository).execute('pending')).resolves.toEqual([resource.value]);
    await expect(new ListCommentReportsQuery(repository).execute('pending')).resolves.toEqual([comment.value]);
    expect(listResources).toHaveBeenCalledWith('pending');
    expect(listComments).toHaveBeenCalledWith('pending');
  });

  it('RPT-RF-004/RPT-RNF-002 — resolves/dismisses only the current pending version and surfaces write conflicts', async () => {
    const rr = ResourceReport.create('rr-1', {
      resourceId: 'resource-1',
      reporterAccountId: 'account-1',
      reason: 'spam',
      description: null,
    });
    const cr = CommentReport.create('cr-1', {
      commentId: 'comment-1',
      reporterAccountId: 'account-1',
      reason: 'abuse',
      description: null,
    });
    const saveResource = vi.fn(async () => true);
    const saveComment = vi.fn(async () => true);
    const repository = {
      findResource: vi.fn(async () => rr),
      findComment: vi.fn(async () => cr),
      saveResource,
      saveComment,
    } as never;

    await new ReviewResourceReportCommand(repository).execute('rr-1', 'moderator-1', {
      decision: 'resolved',
      note: 'done',
    });
    await new ReviewCommentReportCommand(repository).execute('cr-1', 'moderator-1', { decision: 'dismissed' });
    expect(saveResource).toHaveBeenCalledWith(rr, 'pending');
    expect(saveComment).toHaveBeenCalledWith(cr, 'pending');
    expect(rr.value).toMatchObject({ status: 'resolved', reviewedByAccountId: 'moderator-1', decisionNote: 'done' });
    expect(cr.value).toMatchObject({ status: 'dismissed', reviewedByAccountId: 'moderator-1' });

    const conflicting = ResourceReport.create('rr-2', {
      resourceId: 'resource-2',
      reporterAccountId: 'account-1',
      reason: 'spam',
      description: null,
    });
    await expect(
      new ReviewResourceReportCommand({
        findResource: vi.fn(async () => conflicting),
        saveResource: vi.fn(async () => false),
      } as never).execute('rr-2', 'moderator-1', { decision: 'resolved' }),
    ).rejects.toMatchObject({ code: 'CONTENT_UPDATE_CONFLICT' });
  });
});
