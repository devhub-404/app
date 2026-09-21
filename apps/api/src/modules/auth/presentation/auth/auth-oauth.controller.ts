import { Body, Controller, Param, Post, Req, Res, UseGuards, Version } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LocalRateLimitGuard, RATE_LIMIT_POLICIES } from '@/app/runtime/rate-limit';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { Public } from '@/shared/nest/decorators/public';
import { User } from '@/modules/auth/public/http';
import type { AuthenticatedPrincipalDTO } from '@/modules/auth/public/http';
import { StartOAuthLoginCommand } from '@/modules/auth/application/oauth/use-cases/command/start-oauth-login.command';
import { CompleteOAuthLoginCommand } from '@/modules/auth/application/oauth/use-cases/command/complete-oauth-login.command';
import { StartOAuthLinkCommand } from '@/modules/auth/application/oauth/use-cases/command/start-oauth-link.command';
import { CompleteOAuthLinkCommand } from '@/modules/auth/application/oauth/use-cases/command/complete-oauth-link.command';
import type { OAuthProviderName } from '@/modules/auth/public/oauth';
import {
  CompleteOAuthLoginDTO,
  CompleteOAuthLinkDTO,
} from '@/modules/auth/application/oauth/dtos/in';
import {
  OAuthAuthorizationDTO,
  OAuthCredentialLinkedDTO,
  OAuthLoginDTO,
} from '@/modules/auth/application/oauth/dtos/out';
import { ParseOAuthProviderPipe } from '@/modules/auth/presentation/pipes/parse-oauth-provider.pipe';
import {
  clearOAuthBrowserContextCookie,
  getOAuthBrowserContextFromRequest,
  setOAuthBrowserContextCookie,
  setSessionCookie,
} from '@/modules/auth/presentation/utils/auth-cookies.util';
import { AppError } from '@/shared/errors/app-error';
import { Inject } from '@nestjs/common';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { ApiParam } from '@nestjs/swagger';

@Controller()
@UseGuards(AuthGuard, LocalRateLimitGuard)
@Throttle({ local: RATE_LIMIT_POLICIES.authInteractive })
export class AuthOAuthController {
  constructor(
    private readonly startOAuthLoginCommand: StartOAuthLoginCommand,
    private readonly completeOAuthLoginCommand: CompleteOAuthLoginCommand,
    private readonly startOAuthLinkCommand: StartOAuthLinkCommand,
    private readonly completeOAuthLinkCommand: CompleteOAuthLinkCommand,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  @Version('1')
  @Post('oauth/:provider/login/start')
  @ApiParam({ name: 'provider', enum: ['github', 'google'] })
  @Public()
  @AppResponse('OAUTH_LOGIN_STARTED', OAuthAuthorizationDTO)
  async startOAuthLogin(
    @Param('provider', ParseOAuthProviderPipe) provider: OAuthProviderName,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<OAuthAuthorizationDTO> {
    const result = await this.startOAuthLoginCommand.execute({ provider });
    setOAuthBrowserContextCookie(reply, 'login', provider, result.browserContext, this.config.secureCookies);

    return { url: result.url, stateToken: result.stateToken };
  }

  @Version('1')
  @Post('oauth/:provider/login/complete')
  @ApiParam({ name: 'provider', enum: ['github', 'google'] })
  @Public()
  @AppResponse('OAUTH_LOGIN_COMPLETED', OAuthLoginDTO, { nullable: true })
  async completeOAuthLogin(
    @Param('provider', ParseOAuthProviderPipe) provider: OAuthProviderName,
    @Body() body: CompleteOAuthLoginDTO,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<OAuthLoginDTO | { mfaRequired: true; token: string; methods: string[] } | null> {
    const browserContext = getOAuthBrowserContextFromRequest(request, 'login', provider);
    clearOAuthBrowserContextCookie(reply, 'login', provider, this.config.secureCookies);
    if (!browserContext) throw new AppError('AUTH_TOKEN_INVALID');

    const result = await this.completeOAuthLoginCommand.execute(provider, {
      code: body.code,
      stateToken: body.stateToken,
      browserState: browserContext.state,
      codeVerifier: browserContext.codeVerifier,
      ipAddress: request.ip ?? null,
      userAgent: typeof request.headers['user-agent'] === 'string' ? request.headers['user-agent'] : null,
    });

    if ('restoreAccessRequested' in result) {
      return { restoreAccessRequested: true };
    }

    if ('mfaRequired' in result) {
      return { mfaRequired: true, token: result.token, methods: result.methods };
    }

    if ('reactivationRequired' in result) {
      return { reactivationToken: result.token };
    }

    if (!result.sessionSecret) throw new Error('OAuth login did not produce a session secret');
    setSessionCookie(reply, result.sessionSecret, this.config.secureCookies);

    return {};
  }

  @Version('1')
  @Post('oauth/:provider/link/start')
  @ApiParam({ name: 'provider', enum: ['github', 'google'] })
  @AppResponse('OAUTH_LINK_STARTED', OAuthAuthorizationDTO)
  async startOAuthLink(
    @Param('provider', ParseOAuthProviderPipe) provider: OAuthProviderName,
    @User() user: AuthenticatedPrincipalDTO,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<OAuthAuthorizationDTO> {
    const result = await this.startOAuthLinkCommand.execute({ userId: user.sub, sessionId: user.sid, provider });
    setOAuthBrowserContextCookie(reply, 'link', provider, result.browserContext, this.config.secureCookies);

    return { url: result.url, stateToken: result.stateToken };
  }

  @Version('1')
  @Post('oauth/:provider/link/complete')
  @ApiParam({ name: 'provider', enum: ['github', 'google'] })
  @AppResponse('OAUTH_LINKED', OAuthCredentialLinkedDTO)
  async completeOAuthLink(
    @Param('provider', ParseOAuthProviderPipe) provider: OAuthProviderName,
    @Body() body: CompleteOAuthLinkDTO,
    @User() user: AuthenticatedPrincipalDTO,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<OAuthCredentialLinkedDTO> {
    const browserContext = getOAuthBrowserContextFromRequest(request, 'link', provider);
    clearOAuthBrowserContextCookie(reply, 'link', provider, this.config.secureCookies);
    if (!browserContext) throw new AppError('AUTH_TOKEN_INVALID');

    return await this.completeOAuthLinkCommand.execute(provider, {
      userId: user.sub,
      sessionId: user.sid,
      code: body.code,
      stateToken: body.stateToken,
      browserState: browserContext.state,
      codeVerifier: browserContext.codeVerifier,
    });
  }
}
