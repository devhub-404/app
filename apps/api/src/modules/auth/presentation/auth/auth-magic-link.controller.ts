import { Body, Controller, Post, Req, Res, UseGuards, Version } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LocalRateLimitGuard, RATE_LIMIT_POLICIES } from '@/app/runtime/rate-limit';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { Public } from '@/shared/nest/decorators/public';
import { GenericPublicAckDTO } from '@/modules/auth/public/http';
import { CompleteMagicLinkLoginDTO, StartMagicLinkLoginDTO } from '@/modules/auth/application/magic-link/dtos/in';
import { MagicLinkLoginDTO } from '@/modules/auth/application/magic-link/dtos/out';
import { StartMagicLinkLoginCommand } from '@/modules/auth/application/magic-link/use-cases/command/start-magic-link-login.command';
import { CompleteMagicLinkLoginCommand } from '@/modules/auth/application/magic-link/use-cases/command/complete-magic-link-login.command';
import { setSessionCookie } from '@/modules/auth/presentation/utils/auth-cookies.util';
import { Inject } from '@nestjs/common';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';

@Controller()
@UseGuards(LocalRateLimitGuard)
@Throttle({ local: RATE_LIMIT_POLICIES.authInteractive })
export class AuthMagicLinkController {
  constructor(
    private readonly startMagicLinkLoginCommand: StartMagicLinkLoginCommand,
    private readonly completeMagicLinkLoginCommand: CompleteMagicLinkLoginCommand,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  @Version('1')
  @Post('login/magic-link/start')
  @Throttle({ local: RATE_LIMIT_POLICIES.authEmail })
  @Public()
  @AppResponse('MAGIC_LINK_LOGIN_STARTED', GenericPublicAckDTO)
  async startMagicLinkLogin(@Body() body: StartMagicLinkLoginDTO): Promise<GenericPublicAckDTO> {
    return await this.startMagicLinkLoginCommand.execute(body);
  }

  @Version('1')
  @Post('login/magic-link/complete')
  @Public()
  @AppResponse('MAGIC_LINK_LOGIN_COMPLETED', MagicLinkLoginDTO, { nullable: true })
  async completeMagicLinkLogin(
    @Body() body: CompleteMagicLinkLoginDTO,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<MagicLinkLoginDTO | null> {
    const result = await this.completeMagicLinkLoginCommand.execute({
      ...body,
      ipAddress: request.ip ?? null,
      userAgent: typeof request.headers['user-agent'] === 'string' ? request.headers['user-agent'] : null,
    });

    if ('restoreAccessRequested' in result) {
      return { restoreAccessRequested: true };
    }

    if ('mfaRequired' in result) {
      return { mfaRequired: true, token: result.token, methods: result.methods, redirect: result.redirect };
    }

    if ('reactivationRequired' in result) {
      return { reactivationToken: result.token, redirect: result.redirect };
    }

    if (!result.sessionSecret) throw new Error('Magic link login did not produce a session secret');
    setSessionCookie(reply, result.sessionSecret, this.config.secureCookies);

    return { redirect: result.redirect };
  }
}
