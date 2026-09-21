import { describe, expect, it } from 'vitest';
import { RestrictAccountCapabilityCommand } from '@/modules/moderation/application/use-cases/command/restrict-account-capability.command';
import { RevokeAccountRestrictionCommand } from '@/modules/moderation/application/use-cases/command/revoke-account-restriction.command';
import { AccountRestrictionService } from '@/modules/moderation/application/account-restriction.service';
import type { AccountRestrictionRow } from '@/modules/moderation/application/ports/account-restriction.port';

// MOD-RN-008 / MOD-RF-006: a Restriction is a temporal deny gate, never a grant.
describe('Account Restriction lifecycle', () => {
  it('changes the observable capability from allowed -> denied -> allowed when applied and revoked', async () => {
    let row: AccountRestrictionRow | null = null;
    const port = {
      list: async () => (row ? [row] : []),
      findEffective: async (accountId: string, capability: string, now: string) => {
        if (!row || row.accountId !== accountId || row.capability !== capability || row.revokedAt) return null;
        if (row.startsAt > now || (row.endsAt && row.endsAt <= now)) return null;

        return row;
      },
      create: async (
        input: Omit<AccountRestrictionRow, 'id' | 'revokedAt' | 'revokedByAccountId' | 'revokeReason' | 'createdAt'>,
      ) => {
        row = {
          ...input,
          id: 'restriction-1',
          revokedAt: null,
          revokedByAccountId: null,
          revokeReason: null,
          createdAt: new Date().toISOString(),
        };

        return row;
      },
      revoke: async (input: {
        accountId: string;
        restrictionId: string;
        revokedByAccountId: string;
        reason: string;
        revokedAt: string;
      }) => {
        if (!row || row.accountId !== input.accountId || row.id !== input.restrictionId || row.revokedAt) return null;
        row = {
          ...row,
          revokedAt: input.revokedAt,
          revokedByAccountId: input.revokedByAccountId,
          revokeReason: input.reason,
        };

        return row;
      },
    };
    const notificationTypes: string[] = [];
    const notifications = {
      notify: async (input: { type: string }) => {
        notificationTypes.push(input.type);

        return null;
      },
    };
    const gate = new AccountRestrictionService(port as never);

    await expect(gate.assertAccountCapability('account-1', 'COMMENT')).resolves.toBeUndefined();

    await new RestrictAccountCapabilityCommand(port as never, notifications as never).execute(
      'account-1',
      'moderator-1',
      { capability: 'COMMENT', reason: 'Abuso confirmado', startsAt: '2020-01-01T00:00:00.000Z' },
    );

    await expect(gate.assertAccountCapability('account-1', 'COMMENT')).rejects.toMatchObject({
      code: 'ACCOUNT_CAPABILITY_DENIED',
    });
    expect(row).toMatchObject({ accountId: 'account-1', capability: 'COMMENT', appliedByAccountId: 'moderator-1' });

    await new RevokeAccountRestrictionCommand(port as never, notifications as never).execute(
      'account-1',
      'restriction-1',
      'moderator-2',
      { reason: 'Revisão concluída' },
    );

    await expect(gate.assertAccountCapability('account-1', 'COMMENT')).resolves.toBeUndefined();
    expect(row).toMatchObject({ revokedByAccountId: 'moderator-2', revokeReason: 'Revisão concluída' });
    expect(notificationTypes).toEqual(['restriction_applied', 'restriction_revoked']);
  });
});
