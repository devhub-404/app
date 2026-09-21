import { DomainError } from '@/shared/errors/domain-error';

export type RestrictionCapability = 'CONTRIBUTION' | 'COMMENT' | 'VOTE' | 'JOB_PUBLISH';
export type AccountRestrictionState = {
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

export class AccountRestriction {
  private constructor(private readonly state: AccountRestrictionState) {}
  static apply(
    input: Omit<AccountRestrictionState, 'revokedAt' | 'revokedByAccountId' | 'revokeReason' | 'createdAt'>,
    at = new Date(),
  ): AccountRestriction {
    if (!input.accountId || !input.appliedByAccountId || !input.reason.trim())
      throw new DomainError('RESTRICTION_INVALID');

    return new AccountRestriction({
      ...input,
      revokedAt: null,
      revokedByAccountId: null,
      revokeReason: null,
      createdAt: at.toISOString(),
    });
  }
  static rehydrate(state: AccountRestrictionState): AccountRestriction {
    return new AccountRestriction({ ...state });
  }
  get value(): AccountRestrictionState {
    return { ...this.state };
  }
  revoke(byAccountId: string, reason: string, at = new Date()): void {
    if (this.state.revokedAt) throw new DomainError('RESTRICTION_ALREADY_REVOKED');
    if (!byAccountId || !reason.trim()) throw new DomainError('RESTRICTION_INVALID_REVOCATION');
    this.state.revokedAt = at.toISOString();
    this.state.revokedByAccountId = byAccountId;
    this.state.revokeReason = reason;
  }
  isEffective(at = new Date()): boolean {
    const now = at.toISOString();

    return !this.state.revokedAt && this.state.startsAt <= now && (!this.state.endsAt || this.state.endsAt > now);
  }
}
