import type {
  AccountDeletionStatus,
  AccountDerivedStatus,
  AccountModerationStatus,
  AccountVoluntaryStatus,
} from './account-access.ports';
import type { Role } from '@/shared/kernel/auth/role';

export type AccountAuthenticationView = {
  userId: string;
  voluntaryStatus: AccountVoluntaryStatus;
  moderationStatus: AccountModerationStatus;
  deletionStatus: AccountDeletionStatus;
  deletionRequestedAt: Date | null;
  status: AccountDerivedStatus;
  mfaEnabled: boolean;
  lockedUntil: Date | null;
  deletedAt: Date | null;
  primaryEmailVerified: boolean;
  backupEmailVerified: boolean;
  role: Role | null;
};

export type AccountAccessEligibilityView = {
  userId: string;
  voluntaryStatus: AccountVoluntaryStatus;
  moderationStatus: AccountModerationStatus;
  deletionStatus: AccountDeletionStatus;
  lockedUntil: Date | null;
  primaryEmailVerified: boolean;
};

export type VerifiedPrimaryEmailAccount = { userId: string; email: string };
export abstract class AccountServicePort {
  abstract checkEmailAvailability(email: string): Promise<boolean>;
  abstract checkUsernameAvailability(username: string): Promise<boolean>;
  abstract deactivateMe(userId: string): Promise<void>;
  abstract reactivateMe(userId: string): Promise<void>;
  abstract deleteMe(userId: string): Promise<void>;
  abstract restoreDeletedAccount(userId: string): Promise<void>;
  abstract getAuthenticationView(userId: string): Promise<AccountAuthenticationView | null>;
  abstract getAccessEligibility(userId: string): Promise<AccountAccessEligibilityView | null>;
  abstract findVerifiedPrimaryEmailAccount(email: string): Promise<VerifiedPrimaryEmailAccount | null>;
}
export const ACCOUNT_SERVICE = 'ACCOUNT_SERVICE';
