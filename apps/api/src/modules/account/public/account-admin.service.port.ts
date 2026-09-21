export type AccountRoleName = 'curator' | 'admin' | 'moderator';
export const PLATFORM_ROLE_NAMES = ['curator', 'admin', 'moderator'] as const;

export type AccountAdminUser = {
  id: string;
  voluntaryStatus: 'active' | 'deactivated';
  moderationStatus: 'none' | 'suspended' | 'banned';
  deletionStatus: 'none' | 'pending';
  deletionRequestedAt: Date | null;
  status: 'active' | 'deactivated' | 'suspended' | 'banned';
  mfaEnabled: boolean;
  lockedUntil: Date | null;
  email: string | null;
  username: string | null;
  role: AccountRoleName | null;
  createdAt: Date;
};

export type AccountAdminUsersPage = {
  data: AccountAdminUser[];
  total: number;
  page: number;
  pageSize: number;
};

export type AccountRoleAssignment = { userId: string; role: AccountRoleName | null };

export abstract class AccountAdminServicePort {
  abstract suspend(userId: string, lockedUntil?: string): Promise<void>;
  abstract unsuspend(userId: string): Promise<void>;
  abstract ban(userId: string): Promise<void>;
  abstract unban(userId: string): Promise<void>;
  abstract assignRole(userId: string, role: AccountRoleName | null): Promise<AccountRoleAssignment>;
  abstract listUsers(page: number, pageSize: number): Promise<AccountAdminUsersPage>;
  abstract getAccount(userId: string): Promise<AccountAdminUser | null>;
}

export const ACCOUNT_ADMIN_SERVICE = 'ACCOUNT_ADMIN_SERVICE';
