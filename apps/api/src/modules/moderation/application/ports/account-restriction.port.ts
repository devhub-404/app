import type { RestrictionCapability } from '@/modules/moderation/public/account-restriction.port';

export type AccountRestrictionRow = {
  id: string;
  accountId: string;
  capability: RestrictionCapability;
  reason: string;
  startsAt: string;
  endsAt: string | null;
  appliedByAccountId: string;
  revokedAt: string | null;
  revokedByAccountId: string | null;
  revokeReason: string | null;
  createdAt: string;
};

export abstract class AccountRestrictionPort {
  abstract list(accountId: string): Promise<AccountRestrictionRow[]>;
  abstract deleteByAccountId(accountId: string): Promise<number>;
  abstract findEffective(
    accountId: string,
    capability: RestrictionCapability,
    now: string,
  ): Promise<AccountRestrictionRow | null>;
  abstract create(
    input: Omit<AccountRestrictionRow, 'id' | 'revokedAt' | 'revokedByAccountId' | 'revokeReason' | 'createdAt'>,
  ): Promise<AccountRestrictionRow>;
  abstract revoke(input: {
    accountId: string;
    restrictionId: string;
    revokedByAccountId: string;
    reason: string;
    revokedAt: string;
  }): Promise<AccountRestrictionRow | null>;
}
