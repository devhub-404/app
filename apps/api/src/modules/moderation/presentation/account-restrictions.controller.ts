import { Body, Controller, Get, Param, Post, UseGuards, Version } from '@nestjs/common';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { RoleGuard } from '@/shared/nest/guards/role.guard';
import { Roles } from '@/shared/nest/decorators/roles.decorator';
import { User } from '@/modules/auth/public/http';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import { Role } from '@/shared/kernel/auth/role';
import type { User as AuthenticatedUser } from '@/shared/kernel/auth/authenticated-user';
import { RestrictAccountCapabilityCommand } from '@/modules/moderation/application/use-cases/command/restrict-account-capability.command';
import { RevokeAccountRestrictionCommand } from '@/modules/moderation/application/use-cases/command/revoke-account-restriction.command';
import { GetAccountStandingQuery } from '@/modules/moderation/application/use-cases/query/get-account-standing.query';
import {
  GetAccountStandingOutputDTO,
  RestrictAccountCapabilityInputDTO,
  RestrictAccountCapabilityOutputDTO,
  RevokeAccountRestrictionInputDTO,
  RevokeAccountRestrictionOutputDTO,
} from '@/modules/moderation/application/dtos';

@Controller('moderation/accounts')
@UseGuards(AuthGuard, RoleGuard)
export class AccountRestrictionsController {
  constructor(
    private readonly getAccountStanding: GetAccountStandingQuery,
    private readonly restrictAccountCapability: RestrictAccountCapabilityCommand,
    private readonly revokeAccountRestriction: RevokeAccountRestrictionCommand,
  ) {}

  @Version('1')
  @Get(':accountId/standing')
  @Roles([Role.MODERATOR, Role.ADMIN])
  @AppResponse('ACCOUNT_STANDING_RETRIEVED', GetAccountStandingOutputDTO)
  getStanding(@Param('accountId', ParseUUIDPipe) accountId: string) {
    return this.getAccountStanding.execute({ accountId });
  }

  @Version('1')
  @Post(':accountId/restrictions')
  @Roles([Role.MODERATOR, Role.ADMIN])
  @AppResponse('ACCOUNT_CAPABILITY_RESTRICTED', RestrictAccountCapabilityOutputDTO)
  restrict(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @User() actor: AuthenticatedUser,
    @Body() body: RestrictAccountCapabilityInputDTO,
  ) {
    return this.restrictAccountCapability.execute(accountId, actor.sub, body);
  }

  @Version('1')
  @Post(':accountId/restrictions/:restrictionId/revoke')
  @Roles([Role.MODERATOR, Role.ADMIN])
  @AppResponse('ACCOUNT_RESTRICTION_REVOKED', RevokeAccountRestrictionOutputDTO)
  revoke(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Param('restrictionId', ParseUUIDPipe) restrictionId: string,
    @User() actor: AuthenticatedUser,
    @Body() body: RevokeAccountRestrictionInputDTO,
  ) {
    return this.revokeAccountRestriction.execute(accountId, restrictionId, actor.sub, body);
  }
}
