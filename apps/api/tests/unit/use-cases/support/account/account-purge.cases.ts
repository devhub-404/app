import { describe, expect, it, vi } from 'vitest';
import { AccountPurgeRequestedEvent } from '@/modules/account/public/events';
import { HandleAuthAccountPurgeRequestedListener } from '@/modules/auth/application/core/listeners/handle-account-purge-requested.listener';
import { HandleNotificationAccountPurgeRequestedListener } from '@/modules/notification/application/handle-account-purge-requested.listener';
import { PurgeDeletedAccountsCommand } from '@/modules/account/application/account/use-cases/command/purge-deleted-accounts.command';

describe('account purge ownership barrier', () => {
  it('lets owners with private non-relational state purge through the account event', async () => {
    const calls: string[] = [];
    const auth = new HandleAuthAccountPurgeRequestedListener(
      { deleteByUserId: async (id: string) => void calls.push(`sessions:${id}`) } as never,
      { deleteByUserId: async (id: string) => void calls.push(`credentials:${id}`) } as never,
      { deleteByUserId: async (id: string) => void calls.push(`totp:${id}`) } as never,
      { deleteByUserId: async (id: string) => void calls.push(`recovery:${id}`) } as never,
      { deleteBySubjectId: async (id: string) => (calls.push(`proofs:${id}`), 1) } as never,
    );
    const notifications = new HandleNotificationAccountPurgeRequestedListener({
      deleteByAccountId: async (id: string) => (calls.push(`notifications:${id}`), 1),
    } as never);

    const event = new AccountPurgeRequestedEvent('user-1');
    await auth.handle(event);
    await notifications.handle(event);

    expect(calls).toEqual([
      'sessions:user-1',
      'totp:user-1',
      'recovery:user-1',
      'credentials:user-1',
      'proofs:user-1',
      'notifications:user-1',
    ]);
  });

  it('ART-RN-008/PRJ-RN-008 — deletes the Account through FK semantics and then collects orphan Resource identities', async () => {
    const repository = {
      listDeletionPurgeCandidateIds: vi.fn(async () => ['user-1']),
      deleteById: vi.fn(async () => undefined),
    };
    const emitter = { emitAsync: vi.fn(async () => []) };
    const resources = { removeOrphans: vi.fn(async () => 2) };
    const command = new PurgeDeletedAccountsCommand(repository as never, emitter as never, resources as never);

    await expect(command.execute({ now: new Date('2030-01-01T00:00:00.000Z') })).resolves.toEqual({ purgedCount: 1 });
    expect(repository.deleteById).toHaveBeenCalledWith('user-1');
    expect(resources.removeOrphans).toHaveBeenCalledTimes(1);
  });
});
