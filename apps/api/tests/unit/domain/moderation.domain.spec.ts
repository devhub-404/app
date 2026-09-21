import { describe, expect, it } from 'vitest';
import { AccountRestriction } from '@/modules/moderation/domain';

describe('AccountRestriction domain', () => {
  const at = new Date('2026-01-01T00:00:00.000Z');
  const input = {
    id: 'restriction-1',
    accountId: 'account-1',
    capability: 'VOTE' as const,
    reason: 'Abuso confirmado',
    startsAt: at.toISOString(),
    endsAt: null,
    appliedByAccountId: 'moderator-1',
  };

  it('MOD-RN-003 — creates an effective deny restriction with audit provenance', () => {
    const restriction = AccountRestriction.apply(input, at);
    expect(restriction.value).toMatchObject({
      ...input,
      revokedAt: null,
      revokedByAccountId: null,
      revokeReason: null,
      createdAt: at.toISOString(),
    });
    expect(restriction.isEffective(at)).toBe(true);
  });

  it('MOD-RN-003 — respects start, end and revocation when evaluating effectiveness', () => {
    const restriction = AccountRestriction.apply(
      { ...input, startsAt: '2026-02-01T00:00:00.000Z', endsAt: '2026-03-01T00:00:00.000Z' },
      at,
    );
    expect(restriction.isEffective(new Date('2026-01-31T23:59:59.000Z'))).toBe(false);
    expect(restriction.isEffective(new Date('2026-02-15T00:00:00.000Z'))).toBe(true);
    expect(restriction.isEffective(new Date('2026-03-01T00:00:00.000Z'))).toBe(false);
    restriction.revoke('moderator-2', 'Revisão concluída', new Date('2026-02-15T00:00:00.000Z'));
    expect(restriction.isEffective(new Date('2026-02-16T00:00:00.000Z'))).toBe(false);
    expect(() => restriction.revoke('moderator-3', 'Duplicada')).toThrow('RESTRICTION_ALREADY_REVOKED');
  });

  it('MOD-RN-001/MOD-RN-003 — requires actor and reason for application and revocation', () => {
    expect(() => AccountRestriction.apply({ ...input, reason: ' ' })).toThrow('RESTRICTION_INVALID');
    const restriction = AccountRestriction.apply(input);
    expect(() => restriction.revoke('', 'reason')).toThrow('RESTRICTION_INVALID_REVOCATION');
    expect(() => restriction.revoke('moderator-1', ' ')).toThrow('RESTRICTION_INVALID_REVOCATION');
  });
});
