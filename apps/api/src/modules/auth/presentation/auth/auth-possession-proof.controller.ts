import { Body, Controller, Inject, Post, Req, Res, UseGuards, Version } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LocalRateLimitGuard, RATE_LIMIT_POLICIES } from '@/app/runtime/rate-limit';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { User } from '@/modules/auth/public/http';
import type { AuthenticatedPrincipalDTO } from '@/modules/auth/public/http';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { getSessionSecretFromRequest, setSessionCookie } from '@/modules/auth/presentation/utils/auth-cookies.util';
import { SendPossessionProofEmailCodeCommand } from '@/modules/auth/application/auth/use-cases/command/send-possession-proof-email-code.command';
import { EvaluatePossessionProofRequirementQuery } from '@/modules/auth/application/auth/use-cases/query/evaluate-possession-proof-requirement.query';
import { PossessionProofCompleteDTO } from '@/modules/auth/application/auth/dtos/in';
import {
  PossessionProofRequirementResultDTO,
  PossessionProofStartedDTO,
} from '@/modules/auth/application/auth/dtos/out';

@Controller()
@UseGuards(AuthGuard, LocalRateLimitGuard)
@Throttle({ local: RATE_LIMIT_POLICIES.authInteractive })
export class AuthPossessionProofController {
  constructor(
    private readonly sendPossessionProofEmailCodeCommand: SendPossessionProofEmailCodeCommand,
    private readonly evaluatePossessionProofRequirementQuery: EvaluatePossessionProofRequirementQuery,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  @Version('1')
  @Post('possession-proof/start')
  @AppResponse('POSSESSION_PROOF_STARTED', PossessionProofStartedDTO)
  async start(@User() user: AuthenticatedPrincipalDTO): Promise<PossessionProofStartedDTO> {
    return await this.sendPossessionProofEmailCodeCommand.execute({ userId: user.sub });
  }

  @Version('1')
  @Post('possession-proof/complete')
  @AppResponse('POSSESSION_PROOF_COMPLETED', PossessionProofRequirementResultDTO)
  async complete(
    @User() user: AuthenticatedPrincipalDTO,
    @Body() body: PossessionProofCompleteDTO,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<PossessionProofRequirementResultDTO> {
    const result = await this.evaluatePossessionProofRequirementQuery.execute(
      user.sub,
      user.sid,
      body.emailCode,
      body.mfaMethod && body.mfaCode ? { method: body.mfaMethod, code: body.mfaCode } : undefined,
    );
    if (result.accepted) {
      const sessionSecret = getSessionSecretFromRequest(request);
      if (!sessionSecret) throw new Error('Authenticated request missing Session cookie');
      setSessionCookie(reply, sessionSecret, this.config.secureCookies);
    }

    return result;
  }
}
