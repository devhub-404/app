import { Injectable } from '@nestjs/common';
import { AssignAccountRolesCommand } from '@/modules/account/application/admin/use-cases/command/assign-user-roles.command';
import { BanAccountCommand } from '@/modules/account/application/admin/use-cases/command/ban-account.command';
import { SuspendAccountCommand } from '@/modules/account/application/admin/use-cases/command/suspend-account.command';
import { UnbanAccountCommand } from '@/modules/account/application/admin/use-cases/command/unban-account.command';
import { UnsuspendAccountCommand } from '@/modules/account/application/admin/use-cases/command/unsuspend-account.command';
import { ListAccountsQuery } from '@/modules/account/application/admin/use-cases/query/list-users.query';
import {
  AccountAdminServicePort,
  type AccountAdminUsersPage,
  type AccountRoleAssignment,
  type AccountRoleName,
} from '@/modules/account/public/account-admin.service.port';

@Injectable()
export class AccountAdminService implements AccountAdminServicePort {
  constructor(
    private readonly suspendCommand: SuspendAccountCommand,
    private readonly unsuspendCommand: UnsuspendAccountCommand,
    private readonly banCommand: BanAccountCommand,
    private readonly unbanCommand: UnbanAccountCommand,
    private readonly assignRolesCommand: AssignAccountRolesCommand,
    private readonly listUsersQuery: ListAccountsQuery,
  ) {}

  async suspend(userId: string, lockedUntil?: string): Promise<void> {
    await this.suspendCommand.execute(userId, lockedUntil);
  }
  async unsuspend(userId: string): Promise<void> {
    await this.unsuspendCommand.execute(userId);
  }
  async ban(userId: string): Promise<void> {
    await this.banCommand.execute(userId);
  }
  async unban(userId: string): Promise<void> {
    await this.unbanCommand.execute(userId);
  }
  async assignRole(userId: string, role: AccountRoleName | null): Promise<AccountRoleAssignment> {
    return await this.assignRolesCommand.execute(userId, role);
  }
  async listUsers(page: number, pageSize: number): Promise<AccountAdminUsersPage> {
    return await this.listUsersQuery.execute(page, pageSize);
  }
  async getAccount(userId: string) {
    return await this.listUsersQuery.findById(userId);
  }
}
