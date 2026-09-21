import './support/moderation/account-restriction.cases';
import { describe, expect, it, vi } from 'vitest';
import { HideResourceCommand } from '@/modules/moderation/application/use-cases/command/hide-resource.command';
import { HideCommentCommand } from '@/modules/moderation/application/use-cases/command/hide-comment.command';
import { UnhideResourceCommand } from '@/modules/moderation/application/use-cases/command/unhide-resource.command';
import { ListHiddenTargetsQuery } from '@/modules/moderation/application/use-cases/query/list-hidden-targets.query';
import { GetAccountStandingQuery } from '@/modules/moderation/application/use-cases/query/get-account-standing.query';

describe('Moderation use cases', () => {
  const ownerPorts = () => ({
    article: { applyModerationAction: vi.fn(async () => undefined) },
    project: { applyModerationAction: vi.fn(async () => undefined) },
    job: { applyModerationAction: vi.fn(async () => undefined) },
    qAndA: { applyModerationAction: vi.fn(async () => undefined) },
  });

  it.each([
    ['article', 'article', 'hide_article'],
    ['project', 'project', 'hide_project'],
    ['job', 'job', 'hide_job'],
    ['question', 'qAndA', 'hide_question'],
    ['answer', 'qAndA', 'hide_answer'],
  ] as const)(
    'MOD-RF-002/MOD-RN-005 — resolves hideable Resource kind %s and delegates through its owner public contract',
    async (kind, ownerKey, action) => {
      const p = ownerPorts();
      const command = new HideResourceCommand(
        { get: vi.fn(async () => ({ id: 'resource-1', kind })) } as never,
        p.article as never,
        p.project as never,
        p.job as never,
        p.qAndA as never,
      );
      await command.execute('resource-1', 'reason');
      const owner = p[ownerKey];
      expect(owner.applyModerationAction).toHaveBeenCalledWith(
        'resource-1',
        action,
        ...(kind === 'article' ? ['reason'] : []),
      );
    },
  );

  it.each(['news', 'event', 'external_resource'] as const)(
    'MOD-RN-002/MOD-RN-005 — rejects editorial Resource kind %s as non-hideable',
    async (kind) => {
      const p = ownerPorts();
      const command = new HideResourceCommand(
        { get: vi.fn(async () => ({ id: 'resource-1', kind })) } as never,
        p.article as never,
        p.project as never,
        p.job as never,
        p.qAndA as never,
      );
      await expect(command.execute('resource-1')).rejects.toMatchObject({ code: 'MODERATION_ACTION_NOT_SUPPORTED' });
    },
  );

  it('moderates Comment through its explicit flow instead of Resource polymorphism', async () => {
    const apply = vi.fn(async () => undefined);
    await new HideCommentCommand({ apply } as never).execute('comment-1');
    expect(apply).toHaveBeenCalledWith('comment-1', 'hide_comment');
  });

  it('unhides Resources and lists Resource/Comment hidden projections through visibility port', async () => {
    const unhideResource = vi.fn(async () => undefined);
    const listHidden = vi.fn(async () => [
      {
        kind: 'resource' as const,
        resourceKind: 'article' as const,
        resourceId: 'article-1',
        hiddenAt: '2026-08-01T00:00:00.000Z',
      },
      { kind: 'comment' as const, commentId: 'comment-1', hiddenAt: '2026-08-01T00:00:00.000Z' },
    ]);
    const visibility = { unhideResource, listHidden } as never;
    await new UnhideResourceCommand(visibility).execute('article-1');
    await expect(new ListHiddenTargetsQuery(visibility).execute()).resolves.toHaveLength(2);
    expect(unhideResource).toHaveBeenCalledWith('article-1');
  });

  it('keeps Account standing independent from content moderation', async () => {
    const restrictions = [
      { id: 'r-current', capability: 'COMMENT', startsAt: '2020-01-01T00:00:00.000Z', endsAt: null, revokedAt: null },
    ];
    await expect(
      new GetAccountStandingQuery({ list: vi.fn(async () => restrictions) } as never).execute({
        accountId: 'account-1',
      }),
    ).resolves.toMatchObject({ accountId: 'account-1', standing: 'restricted', restrictions });
  });
});
