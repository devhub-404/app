import { Body, Controller, Inject, Post, Req, Res, UseGuards, Version } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LocalRateLimitGuard, RATE_LIMIT_POLICIES } from '@/app/runtime/rate-limit';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { Public } from '@/shared/nest/decorators/public';
import { AccountDeletionRestoreAccessDTO, AccountReactivationDTO } from '@/modules/auth/application/auth/dtos/in';
import { SessionOrMfaChallengeDTO } from '@/modules/auth/application/sessions/dtos/out';
import { GenericPublicAckDTO } from '@/modules/auth/public/http';
import { RestoreDeletedAccountAccessCommand } from '@/modules/auth/application/auth/use-cases/command/restore-deleted-account-access.command';
import { ReactivateAccountFromTokenCommand } from '@/modules/auth/application/auth/use-cases/command/reactivate-account-from-token.command';
import { setSessionCookie } from '@/modules/auth/presentation/utils/auth-cookies.util';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';

@Controller()
@UseGuards(AuthGuard, LocalRateLimitGuard)
@Throttle({ local: RATE_LIMIT_POLICIES.authInteractive })
export class UserAccountController {
  constructor(
    private readonly restoreDeletedAccountAccessCommand: RestoreDeletedAccountAccessCommand,
    private readonly reactivateAccountFromTokenCommand: ReactivateAccountFromTokenCommand,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  @Version('1')
  @Post('account/reactivate')
  @ApiOperation({ operationId: 'AccountController_reactivateFromToken_v1' })
  @Public()
  @AppResponse('ACCOUNT_REACTIVATED', SessionOrMfaChallengeDTO)
  async reactivateFromToken(
    @Body() body: AccountReactivationDTO,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<SessionOrMfaChallengeDTO> {
    const result = await this.reactivateAccountFromTokenCommand.execute({
      token: body.token,
      ipAddress: request.ip ?? null,
      userAgent: typeof request.headers['user-agent'] === 'string' ? request.headers['user-agent'] : null,
    });

    if ('mfaRequired' in result) {
      return { mfaRequired: true, token: result.token, methods: result.methods };
    }

    if (!result.sessionSecret) throw new Error('Account reactivation did not produce a session secret');
    setSessionCookie(reply, result.sessionSecret, this.config.secureCookies);

    return {};
  }

  @Version('1')
  @Post('account/deletion/cancel')
  @ApiOperation({ operationId: 'AccountController_cancelDeletion_v1' })
  @Public()
  @AppResponse('ACCOUNT_DELETION_CANCELLED', GenericPublicAckDTO)
  async cancelDeletion(@Body() body: AccountDeletionRestoreAccessDTO): Promise<GenericPublicAckDTO> {
    await this.restoreDeletedAccountAccessCommand.execute(body.token);

    return { acknowledged: true };
  }
}
