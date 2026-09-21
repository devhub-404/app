import './support/account/application-surface.cases';
import './support/account/account-purge.cases';
import './support/account/assign-roles.cases';
import './support/account/profile-composition.cases';
import { describe, expect, it } from 'vitest';
import { SuspendAccountCommand } from '@/modules/account/application/admin/use-cases/command/suspend-account.command';
import { BanAccountCommand } from '@/modules/account/application/admin/use-cases/command/ban-account.command';
import { DeactivateAccountCommand } from '@/modules/account/application/account/use-cases/command/deactivate-account.command';
import { RequestAccountDeletionCommand } from '@/modules/account/application/account/use-cases/command/request-account-deletion.command';
import { RestoreDeletedAccountCommand } from '@/modules/account/application/account/use-cases/command/restore-deleted-account.command';
import { PurgeDeletedAccountsCommand } from '@/modules/account/application/account/use-cases/command/purge-deleted-accounts.command';
import { RestoreDeletedAccountAccessCommand } from '@/modules/auth/application/auth/use-cases/command/restore-deleted-account-access.command';
import { AppError } from '@/shared/errors/app-error';
import { Account } from '@/modules/account/domain/entities/account';

function security(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    voluntaryStatus: 'active' as const,
    moderationStatus: 'none' as const,
    deletionStatus: 'none' as const,
    deletionRequestedAt: null,
    status: 'active' as const,
    mfaEnabled: false,
    lockedUntil: null,
    deletedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function aggregateFrom(state: ReturnType<typeof security>): Account {
  return Account.rehydrate({
    id: state.id,
    voluntaryStatus: state.voluntaryStatus,
    moderationStatus: state.moderationStatus,
    deletionStatus: state.deletionStatus,
    deletionRequestedAt: state.deletionRequestedAt,
    lockedUntil: state.lockedUntil,
  });
}

function persistAggregate(state: ReturnType<typeof security>, aggregate: Account) {
  state.voluntaryStatus = aggregate.voluntaryStatus;
  state.moderationStatus = aggregate.moderationStatus;
  state.deletionStatus = aggregate.deletionStatus;
  state.deletionRequestedAt = aggregate.deletionRequestedAt;
  state.lockedUntil = aggregate.lockedUntil;
}

describe('Account lifecycle use cases', () => {
  it('suspends moderation atomically without touching voluntary state', async () => {
    const state = security({ voluntaryStatus: 'deactivated', status: 'deactivated' });
    const events: unknown[] = [];
    const command = new SuspendAccountCommand(
      {
        findAggregateById: async () => aggregateFrom(state),
        saveAggregate: async (aggregate: Account) => {
          persistAggregate(state, aggregate);

          return true;
        },
      },
      {
        emitAsync: async (_event: string, payload: unknown) => {
          events.push(payload);

          return [];
        },
      } as never,
    );

    await command.execute('user-1');
    expect(state.voluntaryStatus).toBe('deactivated');
    expect(state.moderationStatus).toBe('suspended');
    expect(events).toHaveLength(1);
  });

  it('retries the same suspension idempotently so Session revocation can converge', async () => {
    let revocations = 0;
    const command = new SuspendAccountCommand(
      {
        findAggregateById: async () => aggregateFrom(security({ moderationStatus: 'suspended', lockedUntil: null })),
        saveAggregate: async () => true,
      },
      {
        emitAsync: async () => {
          revocations += 1;

          return [];
        },
      } as never,
    );

    await expect(command.execute('user-1')).resolves.toBeUndefined();
    expect(revocations).toBe(1);
  });

  it('can ban a voluntarily deactivated account without reactivating it', async () => {
    const state = security({ voluntaryStatus: 'deactivated', status: 'deactivated' });
    const command = new BanAccountCommand(
      {
        findAggregateById: async () => aggregateFrom(state),
        saveAggregate: async (aggregate: Account) => {
          persistAggregate(state, aggregate);

          return true;
        },
      },
      { emitAsync: async () => [] } as never,
    );

    await command.execute('user-1');
    expect(state.voluntaryStatus).toBe('deactivated');
    expect(state.moderationStatus).toBe('banned');
  });

  it('changes voluntary and deletion dimensions without overwriting each other', async () => {
    const events: unknown[] = [];
    const state = security();
    const userRepository = {
      findById: async () => state,
      findAggregateById: async () => aggregateFrom(state),
      saveAggregate: async (aggregate: Account) => {
        persistAggregate(state, aggregate);

        return true;
      },
    };
    const eventEmitter = {
      emitAsync: async (_event: string, payload: unknown) => {
        events.push(payload);

        return [];
      },
    };

    await new DeactivateAccountCommand(userRepository, eventEmitter as never).execute('user-1');
    await new RequestAccountDeletionCommand(userRepository, eventEmitter as never).execute('user-1');

    expect(state.voluntaryStatus).toBe('deactivated');
    expect(state.deletionStatus).toBe('pending');
    expect(events).toHaveLength(2);
  });

  it('retries Account deletion cleanups after PENDING was already persisted', async () => {
    const state = security();
    let transitions = 0;
    let cleanups = 0;
    const repository = {
      findAggregateById: async () => aggregateFrom(state),
      saveAggregate: async (aggregate: Account) => {
        transitions += 1;
        persistAggregate(state, aggregate);

        return true;
      },
    };
    const eventEmitter = {
      emitAsync: async () => {
        cleanups += 1;
        if (cleanups === 1) throw new Error('downstream cleanup failed');

        return [];
      },
    };
    const command = new RequestAccountDeletionCommand(repository, eventEmitter as never);

    await expect(command.execute('user-1')).rejects.toThrow('downstream cleanup failed');
    expect(state.deletionStatus).toBe('pending');

    await expect(command.execute('user-1')).resolves.toBeUndefined();
    expect(state.deletionStatus).toBe('pending');
    expect(transitions).toBe(1);
    expect(cleanups).toBe(2);
  });

  it('cancels only the deletion dimension with a restricted proof and never creates a Session', async () => {
    const calls: string[] = [];
    let deletionStatus: 'pending' | 'none' = 'pending';
    const command = new RestoreDeletedAccountAccessCommand(
      {
        verifySingleUse: async (_dto: unknown, _token: string, purpose: string) => {
          calls.push(`verify:${purpose}`);

          return { sub: 'user-1', jti: 'proof-1' };
        },
        consumeSingleUse: async (_payload: unknown, purpose: string) => {
          calls.push(`consume:${purpose}`);

          return true;
        },
      } as never,
      {
        getAuthenticationView: async () => security({ deletionStatus }),
        restoreDeletedAccount: async () => {
          calls.push('account-restore');
          deletionStatus = 'none';
        },
      } as never,
    );

    await expect(command.execute('restore-token')).resolves.toBeUndefined();
    expect(deletionStatus).toBe('none');
    expect(calls).toEqual([
      'verify:account_deletion_restore_access',
      'account-restore',
      'consume:account_deletion_restore_access',
    ]);
  });

  it('re-evaluates a lost Account cancellation race instead of treating it as an authentication flow', async () => {
    let reads = 0;
    const command = new RestoreDeletedAccountAccessCommand(
      { verifySingleUse: async () => ({ sub: 'user-1', jti: 'proof-1' }), consumeSingleUse: async () => true } as never,
      {
        getAuthenticationView: async () => {
          reads += 1;

          return security({ deletionStatus: reads === 1 ? 'pending' : 'none' });
        },
        restoreDeletedAccount: async () => {
          throw new AppError('USER_INVALID_STATUS');
        },
      } as never,
    );

    await expect(command.execute('restore-token')).resolves.toBeUndefined();
    expect(reads).toBe(2);
  });

  it('rejects a cancellation proof when Account remains in a non-restorable deletion state', async () => {
    const command = new RestoreDeletedAccountAccessCommand(
      { verifySingleUse: async () => ({ sub: 'user-1', jti: 'proof-1' }), consumeSingleUse: async () => true } as never,
      {
        getAuthenticationView: async () => security({ deletionStatus: 'pending' }),
        restoreDeletedAccount: async () => {
          throw new AppError('USER_INVALID_STATUS');
        },
      } as never,
    );

    await expect(command.execute('restore-token')).rejects.toThrowError(new AppError('AUTH_TOKEN_INVALID'));
  });

  it('does not let unrelated moderation state prevent deletion cancellation', async () => {
    let restored = false;
    const command = new RestoreDeletedAccountAccessCommand(
      { verifySingleUse: async () => ({ sub: 'user-1', jti: 'proof-1' }), consumeSingleUse: async () => true } as never,
      {
        getAuthenticationView: async () =>
          security({ moderationStatus: 'banned', deletionStatus: 'pending', status: 'banned' }),
        restoreDeletedAccount: async () => {
          restored = true;
        },
      } as never,
    );

    await expect(command.execute('restore-token')).resolves.toBeUndefined();
    expect(restored).toBe(true);
  });

  it('supports retry after Account cancellation when the single-use proof has not yet been consumed', async () => {
    let consumed = 0;
    const command = new RestoreDeletedAccountAccessCommand(
      {
        verifySingleUse: async () => ({ sub: 'user-1', jti: 'proof-1' }),
        consumeSingleUse: async () => {
          consumed += 1;

          return true;
        },
      } as never,
      {
        getAuthenticationView: async () => security({ deletionStatus: 'none' }),
        restoreDeletedAccount: async () => {
          throw new Error('must not restore twice');
        },
      } as never,
    );

    await expect(command.execute('restore-token')).resolves.toBeUndefined();
    expect(consumed).toBe(1);
  });

  it('rejects an already-consumed deletion-cancellation proof', async () => {
    const command = new RestoreDeletedAccountAccessCommand(
      {
        verifySingleUse: async () => ({ sub: 'user-1', jti: 'proof-1' }),
        consumeSingleUse: async () => false,
      } as never,
      { getAuthenticationView: async () => security({ deletionStatus: 'none' }) } as never,
    );

    await expect(command.execute('restore-token')).rejects.toThrowError(new AppError('AUTH_TOKEN_INVALID'));
  });

  it('rejects deletion cancellation when the restricted proof cannot be verified', async () => {
    const command = new RestoreDeletedAccountAccessCommand(
      {
        verifySingleUse: async () => {
          throw new Error('invalid proof');
        },
      } as never,
      {} as never,
    );

    await expect(command.execute('restore-token')).rejects.toThrowError(new AppError('AUTH_TOKEN_INVALID'));
  });

  it('rejects owner-side deletion restore after the retention window even if purge has not run yet', async () => {
    const requestedAt = new Date('2026-06-01T00:00:00.000Z');
    let transitions = 0;
    const command = new RestoreDeletedAccountCommand({
      findAggregateById: async () =>
        aggregateFrom(security({ deletionStatus: 'pending', deletionRequestedAt: requestedAt })),
      saveAggregate: async () => {
        transitions += 1;

        return true;
      },
    });

    await expect(command.execute('user-1', new Date('2026-07-02T00:00:00.000Z'))).rejects.toThrowError(
      new AppError('USER_INVALID_STATUS'),
    );
    expect(transitions).toBe(0);
  });

  it('allows owner-side deletion restore at the retention boundary and changes only deletion state', async () => {
    const requestedAt = new Date('2026-06-30T00:00:00.000Z');
    const state = security({
      voluntaryStatus: 'deactivated',
      moderationStatus: 'suspended',
      deletionStatus: 'pending',
      deletionRequestedAt: requestedAt,
      deletedAt: requestedAt,
    });
    const command = new RestoreDeletedAccountCommand({
      findAggregateById: async () => aggregateFrom(state),
      saveAggregate: async (aggregate: Account) => {
        persistAggregate(state, aggregate);

        return true;
      },
    });

    await expect(command.execute('user-1', new Date('2026-07-30T00:00:00.000Z'))).resolves.toBeUndefined();
    expect(state.voluntaryStatus).toBe('deactivated');
    expect(state.moderationStatus).toBe('suspended');
    expect(state.deletionStatus).toBe('none');
  });

  it('purges only deletion requests older than the thirty-day recovery window and anonymizes Q&A authorship first', async () => {
    let cutoff: Date | undefined;
    const calls: string[] = [];
    const command = new PurgeDeletedAccountsCommand(
      {
        listDeletionPurgeCandidateIds: async (value: Date) => {
          cutoff = value;

          return ['user-1', 'user-2'];
        },
        deleteById: async (accountId: string) => calls.push(`delete:${accountId}`),
      } as never,
      {
        emitAsync: async (_eventName: string, event: { userId: string }) => {
          calls.push(`purge-event:${event.userId}`);

          return [];
        },
      } as never,
      { removeOrphans: vi.fn(async () => 0) } as never,
    );
    const now = new Date('2026-07-30T00:00:00.000Z');

    await expect(command.execute({ now })).resolves.toEqual({ purgedCount: 2 });
    expect(cutoff?.toISOString()).toBe('2026-06-30T00:00:00.000Z');
    expect(calls).toEqual(['purge-event:user-1', 'delete:user-1', 'purge-event:user-2', 'delete:user-2']);
  });
});
