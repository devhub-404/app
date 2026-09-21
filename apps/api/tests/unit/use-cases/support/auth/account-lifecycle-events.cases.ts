import { describe, expect, it, vi } from 'vitest';
import { HandleAccountDeactivatedCommand } from '@/modules/auth/application/auth/use-cases/command/handle-account-deactivated.command';
import { HandleAccountDeletionRequestedCommand } from '@/modules/auth/application/auth/use-cases/command/handle-account-deletion-requested.command';
import { HandleAccountSuspendedCommand } from '@/modules/auth/application/auth/use-cases/command/handle-account-suspended.command';
import { HandleAccountBannedCommand } from '@/modules/auth/application/auth/use-cases/command/handle-account-banned.command';
import { HandleAccountDeactivatedEmailRequestedListener } from '@/modules/auth/application/core/listeners/handle-account-deactivated-email-requested.listener';
import { HandleAccountDeletionEmailRequestedListener } from '@/modules/auth/application/core/listeners/handle-account-deletion-email-requested.listener';

const handlers = [
  [HandleAccountDeactivatedCommand, { userId: 'user-1' }],
  [HandleAccountDeletionRequestedCommand, { userId: 'user-1', deletedAt: '2026-07-30T00:00:00.000Z' }],
  [HandleAccountSuspendedCommand, { userId: 'user-1', lockedUntil: null }],
  [HandleAccountBannedCommand, { userId: 'user-1' }],
] as const;

describe('Account lifecycle handler contract', () => {
  it.each(handlers)('revokes access idempotently for %p', async (Handler, event) => {
    let activeSessions = true;
    const revocations: string[] = [];
    const handler = new Handler({
      execute: async (userId: string) => {
        if (!activeSessions) return;
        activeSessions = false;
        revocations.push(userId);
      },
    } as never);

    await handler.handle(event as never);
    await handler.handle(event as never);

    expect(revocations).toEqual(['user-1']);
  });
});

describe('Account lifecycle email listeners', () => {
  const verifiedPrimary = {
    id: 'email-1',
    userId: 'user-1',
    email: 'person@example.com',
    type: 'primary' as const,
    verifiedAt: new Date('2026-08-01T00:00:00.000Z'),
  };

  it('sends a deactivation notice to the verified primary email', async () => {
    const send = vi.fn(async () => undefined);
    const accountEmailAccess = {
      findPrimaryByUserId: vi.fn(async () => ({ id: verifiedPrimary.id, email: verifiedPrimary.email })),
      findByEmail: vi.fn(async () => verifiedPrimary),
    };
    const listener = new HandleAccountDeactivatedEmailRequestedListener({ send }, accountEmailAccess as never);

    await listener.handle({ userId: 'user-1' });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ to: verifiedPrimary.email, subject: 'Conta desativada' }),
    );
  });

  it('requests a restore email when deletion is requested', async () => {
    const restore = vi.fn(async () => undefined);
    const accountEmailAccess = {
      findPrimaryByUserId: vi.fn(async () => ({ id: verifiedPrimary.id, email: verifiedPrimary.email })),
      findByEmail: vi.fn(async () => verifiedPrimary),
    };
    const listener = new HandleAccountDeletionEmailRequestedListener(
      accountEmailAccess as never,
      {
        execute: restore,
      } as never,
    );

    await listener.handle({ userId: 'user-1', deletedAt: '2026-08-01T00:00:00.000Z' });

    expect(restore).toHaveBeenCalledWith({ userId: 'user-1', email: verifiedPrimary.email });
  });
});
