import { describe, expect, it, vi } from 'vitest';
import { ScheduledJobsController } from '@/app/scheduled-jobs.controller';
import { env } from '@/app/config/env';

// Normative source: docs/adr/ADR-009-cloudflare-serverless-deployment.md.
describe('Scheduled execution orchestration', () => {
  it('delegates temporal rules to the owning service rather than duplicating domain logic', async () => {
    const purgeAuthArtifacts = vi.fn(async () => 0);
    const purgeOldNotifications = vi.fn(async () => 0);
    const purgeDeletedAccounts = vi.fn(async () => ({ purgedCount: 0 }));
    const controller = new ScheduledJobsController(
      { execute: purgeAuthArtifacts } as never,
      { execute: purgeOldNotifications } as never,
      { execute: purgeDeletedAccounts } as never,
    );
    if (!env.scheduledJobsSecret) return;

    await controller.run(env.scheduledJobsSecret);
    expect(purgeAuthArtifacts).toHaveBeenCalledTimes(1);
    expect(purgeOldNotifications).toHaveBeenCalledTimes(1);
    expect(purgeDeletedAccounts).toHaveBeenCalledTimes(1);
  });

  it('treats repeated scheduler delivery as repeated owner invocations, with no in-memory deduplication', async () => {
    const purgeAuthArtifacts = vi.fn(async () => 0);
    const purgeOldNotifications = vi.fn(async () => 0);
    const purgeDeletedAccounts = vi.fn(async () => ({ purgedCount: 0 }));
    const controller = new ScheduledJobsController(
      { execute: purgeAuthArtifacts } as never,
      { execute: purgeOldNotifications } as never,
      { execute: purgeDeletedAccounts } as never,
    );
    if (!env.scheduledJobsSecret) return;

    await controller.run(env.scheduledJobsSecret);
    await controller.run(env.scheduledJobsSecret);
    expect(purgeAuthArtifacts).toHaveBeenCalledTimes(2);
    expect(purgeOldNotifications).toHaveBeenCalledTimes(2);
    expect(purgeDeletedAccounts).toHaveBeenCalledTimes(2);
  });
});
