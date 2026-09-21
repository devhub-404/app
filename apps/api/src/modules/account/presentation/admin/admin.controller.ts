import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, Version } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LocalRateLimitGuard, RATE_LIMIT_POLICIES } from '@/app/runtime/rate-limit';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { RoleGuard } from '@/shared/nest/guards/role.guard';
import { Roles } from '@/shared/nest/decorators/roles.decorator';
import { User } from '@/modules/auth/public/http';
import { Inject } from '@nestjs/common';
import { ACCOUNT_ADMIN_SERVICE, AccountAdminServicePort } from '@/modules/account/public/account-admin.service.port';
import {
  AccountAdminUsersPageDTO,
  AccountRoleAssignmentDTO,
  AssignAccountRolesDTO,
  ListAccountsQueryDTO,
  SuspendAccountDTO,
} from '@/modules/account/public/account-admin-dtos';
import { PossessionProofServicePort } from '@/modules/auth/public/possession-proof.service.port';
type AuthenticatedPrincipal = { sub: string; sid: string };
import { Role } from '@/shared/kernel/auth/role';

@Controller('accounts')
@UseGuards(AuthGuard, RoleGuard, LocalRateLimitGuard)
@Throttle({ local: RATE_LIMIT_POLICIES.admin })
export class AccountAdminController {
  constructor(
    @Inject(ACCOUNT_ADMIN_SERVICE) private readonly accountAdminService: AccountAdminServicePort,
    @Inject(PossessionProofServicePort) private readonly possessionProofService: PossessionProofServicePort,
  ) {}

  @Version('1')
  @Post(':id/suspend')
  @Roles([Role.ADMIN])
  @AppResponse('USER_SUSPENDED')
  async suspend(@Param('id') id: string, @Body() body: SuspendAccountDTO): Promise<null> {
    await this.accountAdminService.suspend(id, body.lockedUntil);

    return null;
  }

  @Version('1')
  @Post(':id/unsuspend')
  @Roles([Role.ADMIN])
  @AppResponse('USER_UNSUSPENDED')
  async unsuspend(@Param('id') id: string): Promise<null> {
    await this.accountAdminService.unsuspend(id);

    return null;
  }

  @Version('1')
  @Post(':id/ban')
  @Roles([Role.ADMIN])
  @AppResponse('USER_BANNED')
  async ban(@Param('id') id: string): Promise<null> {
    await this.accountAdminService.ban(id);

    return null;
  }

  @Version('1')
  @Post(':id/unban')
  @Roles([Role.ADMIN])
  @AppResponse('USER_UNBANNED')
  async unban(@Param('id') id: string): Promise<null> {
    await this.accountAdminService.unban(id);

    return null;
  }

  @Version('1')
  @Patch(':id/roles')
  @Roles([Role.ADMIN])
  @AppResponse('USER_ROLES_UPDATED', AccountRoleAssignmentDTO)
  async assignRoles(
    @Param('id') id: string,
    @Body() body: AssignAccountRolesDTO,
    @User() user: AuthenticatedPrincipal,
  ): Promise<AccountRoleAssignmentDTO> {
    await this.possessionProofService.requirePossessionProof(user.sub, user.sid);

    return await this.accountAdminService.assignRole(id, body.role);
  }

  @Version('1')
  @Get()
  @Roles([Role.ADMIN])
  @AppResponse('USERS_LISTED', AccountAdminUsersPageDTO)
  async listAccounts(@Query() query: ListAccountsQueryDTO): Promise<AccountAdminUsersPageDTO> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    return await this.accountAdminService.listUsers(page, pageSize);
  }

  @Version('1')
  @Get(':id')
  @Roles([Role.ADMIN])
  @AppResponse('USER_RETRIEVED')
  async getAccount(@Param('id') id: string) {
    return this.accountAdminService.getAccount(id);
  }
}
