import { Inject, Controller, Delete, Get, Param, Res, UseGuards, Version } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LocalRateLimitGuard } from '@/app/runtime/rate-limit';
import { RATE_LIMIT_POLICIES } from '@/app/runtime/rate-limit';
import type { FastifyReply } from 'fastify';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { User } from '@/modules/auth/public/http';
import type { AuthenticatedPrincipalDTO } from '@/modules/auth/public/http';
import { ListMySessionsQuery } from '@/modules/auth/application/sessions/use-cases/query/list-my-sessions.query';
import { GetCurrentSessionQuery } from '@/modules/auth/application/sessions/use-cases/query/get-current-session.query';
import { RevokeCurrentSessionCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-current-session.command';
import { RevokeSessionByIdCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-session-by-id.command';
import { RevokeOtherSessionsCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-other-sessions.command';
import { RevokeAllSessionsCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-all-sessions.command';
import { clearSessionCookie } from '@/modules/auth/presentation/utils/auth-cookies.util';
import { SessionDTO, SessionListDTO } from '@/modules/auth/application/sessions/dtos/out';
import { PossessionProofServicePort } from '@/modules/auth/public/possession-proof.service.port';

@Controller()
@UseGuards(AuthGuard, LocalRateLimitGuard)
// Session management is intentionally throttled: it is an authenticated,
// stateful surface and should not be used as an unbounded probe.
@Throttle({ local: RATE_LIMIT_POLICIES.sessions })
export class AuthSessionsController {
  constructor(
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
    private readonly listSessionsQuery: ListMySessionsQuery,
    private readonly getCurrentSessionQuery: GetCurrentSessionQuery,
    private readonly revokeCurrentSessionCommand: RevokeCurrentSessionCommand,
    private readonly revokeSessionByIdCommand: RevokeSessionByIdCommand,
    private readonly revokeOtherSessionsCommand: RevokeOtherSessionsCommand,
    private readonly revokeAllSessionsCommand: RevokeAllSessionsCommand,
    @Inject(PossessionProofServicePort) private readonly possessionProofService: PossessionProofServicePort,
  ) {}

  @Version('1')
  @Get('sessions')
  @AppResponse('SESSIONS_LISTED', SessionListDTO)
  async listSessions(@User() user: AuthenticatedPrincipalDTO): Promise<SessionListDTO> {
    return await this.listSessionsQuery.execute(user.sub);
  }

  @Version('1')
  @Get('sessions/current')
  @AppResponse('CURRENT_SESSION_RETRIEVED', SessionDTO, { nullable: true })
  async getCurrentSession(@User() user: AuthenticatedPrincipalDTO): Promise<SessionDTO | null> {
    return await this.getCurrentSessionQuery.execute(user.sub, user.sid);
  }

  @Version('1')
  @Delete('sessions/current')
  @AppResponse('CURRENT_SESSION_REVOKED')
  async revokeCurrentSession(
    @User() user: AuthenticatedPrincipalDTO,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<null> {
    await this.possessionProofService.requirePossessionProof(user.sub, user.sid);
    await this.revokeCurrentSessionCommand.execute(user.sub, user.sid);
    clearSessionCookie(reply, this.config.secureCookies);

    return null;
  }

  @Version('1')
  @Delete('sessions/others')
  @AppResponse('OTHER_SESSIONS_REVOKED')
  async revokeOtherSessions(@User() user: AuthenticatedPrincipalDTO): Promise<null> {
    await this.possessionProofService.requirePossessionProof(user.sub, user.sid);
    await this.revokeOtherSessionsCommand.execute(user.sub, user.sid);

    return null;
  }

  @Version('1')
  @Delete('sessions/:sessionId')
  @AppResponse('SESSION_REVOKED')
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @User() user: AuthenticatedPrincipalDTO,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<null> {
    await this.possessionProofService.requirePossessionProof(user.sub, user.sid);
    await this.revokeSessionByIdCommand.execute(user.sub, sessionId);

    if (sessionId === user.sid) {
      clearSessionCookie(reply, this.config.secureCookies);
    }

    return null;
  }

  @Version('1')
  @Delete('sessions')
  @AppResponse('SESSIONS_REVOKED')
  async revokeAllSessions(
    @User() user: AuthenticatedPrincipalDTO,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<null> {
    await this.possessionProofService.requirePossessionProof(user.sub, user.sid);
    await this.revokeAllSessionsCommand.execute(user.sub);
    clearSessionCookie(reply, this.config.secureCookies);

    return null;
  }
}
