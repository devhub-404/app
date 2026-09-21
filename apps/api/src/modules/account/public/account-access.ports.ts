export type AccountVoluntaryStatus = 'active' | 'deactivated';
export type AccountModerationStatus = 'none' | 'suspended' | 'banned';
export type AccountDeletionStatus = 'none' | 'pending';
export type AccountDerivedStatus = 'active' | 'deactivated' | 'suspended' | 'banned';

export function deriveAccountStatus(
  state: Pick<AccountSecurityState, 'voluntaryStatus' | 'moderationStatus'>,
): AccountDerivedStatus {
  if (state.moderationStatus === 'banned') return 'banned';
  if (state.moderationStatus === 'suspended') return 'suspended';

  return state.voluntaryStatus;
}

export type AccountByEmail = { userId: string; email: string; verifiedAt: Date | null };

export type AccountSecurityState = {
  id: string;
  voluntaryStatus: AccountVoluntaryStatus;
  moderationStatus: AccountModerationStatus;
  deletionStatus: AccountDeletionStatus;
  deletionRequestedAt: Date | null;
  /** Compatibility projection. Not persisted authority. */
  status: AccountDerivedStatus;
  mfaEnabled: boolean;
  lockedUntil: Date | null;
  /** Compatibility alias for deletionRequestedAt while deletion is pending. */
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AccountPrimaryEmail = { email: string; verifiedAt: Date | null };

export abstract class AccountAccessPort {
  abstract create(input: { email?: string | null; emailVerifiedAt?: Date | null }): Promise<string>;
  /** Changes the Account-side MFA projection independently of assigned roles. */
  abstract setMfaEnabled(userId: string, enabled: boolean): Promise<boolean>;
  abstract setLockedUntil(userId: string, lockedUntil: Date | null): Promise<void>;
  abstract findByEmail(email: string): Promise<AccountByEmail | null>;
  abstract findById(userId: string): Promise<AccountSecurityState | null>;
  abstract findPrimaryEmailByUserId(userId: string): Promise<AccountPrimaryEmail | null>;
  abstract deleteById(userId: string): Promise<void>;
  abstract listDeletionPurgeCandidateIds(cutoff: Date): Promise<string[]>;
}

export type AccountEmailLookup = { userId: string; email: string; type: 'primary' | 'backup'; verifiedAt: Date | null };
export type AccountEmailDetails = AccountEmailLookup & { id: string; createdAt: Date };

export abstract class AccountEmailAccessPort {
  abstract create(input: {
    userId: string;
    email: string;
    isPrimary: boolean;
    verifiedAt?: Date | null;
  }): Promise<void>;
  abstract updateEmail(id: string, email: string, verifiedAt: Date | null): Promise<void>;
  abstract setVerifiedAt(userId: string, email: string, verifiedAt: Date): Promise<void>;
  abstract upsertPrimary(input: { userId: string; email: string; verifiedAt: Date }): Promise<void>;
  abstract upsertBackup(input: { userId: string; email: string; verifiedAt: Date }): Promise<void>;
  abstract deleteBackupByUserId(userId: string): Promise<void>;
  abstract findByEmail(email: string): Promise<AccountEmailLookup | null>;
  abstract findPrimaryByUserId(userId: string): Promise<{ id: string; email: string } | null>;
  abstract findBackupByUserId(userId: string): Promise<{ id: string; email: string } | null>;
  abstract listByUserId(userId: string): Promise<AccountEmailDetails[]>;
}

export abstract class AccountUserQueryPort {
  abstract findByEmail(email: string): Promise<AccountByEmail | null>;
  abstract findById(userId: string): Promise<AccountSecurityState | null>;
  abstract findPrimaryEmailByUserId(userId: string): Promise<AccountPrimaryEmail | null>;
}
