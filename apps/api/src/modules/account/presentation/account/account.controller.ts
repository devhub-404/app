import { Controller, Delete, Get, Inject, Post, UnauthorizedException, UseGuards, Version } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LocalRateLimitGuard, RATE_LIMIT_POLICIES } from '@/app/runtime/rate-limit';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { User } from '@/modules/auth/public/http';
import type { AuthenticatedPrincipalDTO } from '@/modules/auth/public/http';
import { PossessionProofServicePort } from '@/modules/auth/public/possession-proof.service.port';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import { AccountDetailsDTO } from '@/modules/account/application/account/dtos/out/account-details.dto';
import { AccountShellDTO } from '@/modules/account/application/account/dtos/out/account-shell.dto';
import { GetMyAccountQuery } from '@/modules/account/application/account/use-cases/query/get-my-account.query';
import { GetMyAccountShellQuery } from '@/modules/account/application/account/use-cases/query/get-my-account-shell.query';

@Controller()
@UseGuards(AuthGuard, LocalRateLimitGuard)
// `/me` is an idempotent read used by the route bootstrap during navigation.
// Keep abuse protection, but allow a normal multi-surface session to refresh
// its authoritative account projection without turning navigation into 429s.
@Throttle({ local: RATE_LIMIT_POLICIES.account })
export class AccountController {
  constructor(
    private readonly getMyAccountQuery: GetMyAccountQuery,
    private readonly getMyAccountShellQuery: GetMyAccountShellQuery,
    @Inject(ACCOUNT_SERVICE) private readonly accountService: AccountServicePort,
    @Inject(PossessionProofServicePort) private readonly possessionProofService: PossessionProofServicePort,
  ) {}

  @Version('1')
  @Get('me')
  @AppResponse('CURRENT_USER_RETRIEVED', AccountShellDTO)
  async getMe(@User() account: { sub: string }): Promise<AccountShellDTO> {
    const shell = await this.getMyAccountShellQuery.execute(account.sub);

    if (!shell) throw new UnauthorizedException();

    return shell;
  }

  @Version('1')
  @Get('me/details')
  @AppResponse('CURRENT_USER_RETRIEVED', AccountDetailsDTO)
  async getMyDetails(@User() account: { sub: string }): Promise<AccountDetailsDTO> {
    return this.getMyAccountQuery.execute(account.sub);
  }

  @Version('1')
  @Post('me/deactivate')
  @AppResponse('ACCOUNT_DEACTIVATED')
  async deactivateMe(@User() account: { sub: string }): Promise<null> {
    await this.accountService.deactivateMe(account.sub);

    return null;
  }

  @Version('1')
  @Delete('me')
  @AppResponse('ACCOUNT_DELETED')
  async deleteMe(@User() account: AuthenticatedPrincipalDTO): Promise<null> {
    await this.possessionProofService.requirePossessionProof(account.sub, account.sid);
    await this.accountService.deleteMe(account.sub);

    return null;
  }
}
