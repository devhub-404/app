import type {
  AccountDeletionStatus,
  AccountDerivedStatus,
  AccountModerationStatus,
  AccountVoluntaryStatus,
} from '@/modules/account/public/account-access.ports';

export type AccountListRow = {
  id: string;
  voluntaryStatus: AccountVoluntaryStatus;
  moderationStatus: AccountModerationStatus;
  deletionStatus: AccountDeletionStatus;
  deletionRequestedAt: Date | null;
  status: AccountDerivedStatus;
  mfaEnabled: boolean;
  lockedUntil: Date | null;
  email: string | null;
  username: string | null;
  role: 'curator' | 'admin' | 'moderator' | null;
  createdAt: Date;
};
export type AccountListResult = { data: AccountListRow[]; total: number };
export abstract class AccountListQueryRepository {
  abstract list(offset: number, limit: number): Promise<AccountListResult>;
  abstract findById(userId: string): Promise<AccountListRow | null>;
}
