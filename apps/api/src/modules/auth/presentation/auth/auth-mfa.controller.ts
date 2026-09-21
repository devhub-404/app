import { Body, Controller, Get, Post, Req, Res, UseGuards, Version } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LocalRateLimitGuard, RATE_LIMIT_POLICIES } from '@/app/runtime/rate-limit';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { Public } from '@/shared/nest/decorators/public';
import { User } from '@/modules/auth/public/http';
import type { AuthenticatedPrincipalDTO } from '@/modules/auth/public/http';
import { StartTotpEnrollmentCommand } from '@/modules/auth/application/mfa/use-cases/command/start-totp-enrollment.command';
import { CompleteTotpEnrollmentCommand } from '@/modules/auth/application/mfa/use-cases/command/complete-totp-enrollment.command';
import { DisableTotpCommand } from '@/modules/auth/application/mfa/use-cases/command/disable-totp.command';
import { RegenerateRecoveryCodesCommand } from '@/modules/auth/application/mfa/use-cases/command/regenerate-recovery-codes.command';
import { VerifyTotpCommand } from '@/modules/auth/application/mfa/use-cases/command/verify-totp.command';
import { VerifyRecoveryCodeCommand } from '@/modules/auth/application/mfa/use-cases/command/verify-recovery-code.command';
import { GetMyMfaConfigurationQuery } from '@/modules/auth/application/mfa/use-cases/query/get-my-mfa-configuration.query';
import { getSessionSecretFromRequest, setSessionCookie } from '@/modules/auth/presentation/utils/auth-cookies.util';
import {
  MfaRecoveryCodeVerifyDTO,
  MfaTotpEnrollCompleteDTO,
  MfaTotpVerifyDTO,
  MfaDisableDTO,
} from '@/modules/auth/application/mfa/dtos/in';
import {
  MfaTotpEnrollStartDTO,
  MfaTotpEnrollCompleteResponseDTO,
  MfaRecoveryCodeSessionDTO,
  MfaRecoveryCodesDTO,
  MfaConfigurationDTO,
} from '@/modules/auth/application/mfa/dtos/out';
import { Inject } from '@nestjs/common';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
@Controller()
@UseGuards(AuthGuard, LocalRateLimitGuard)
// Configuration is a read performed when the security surface mounts. The
// mutations remain authenticated and guarded, but navigation should not turn
// repeated surface visits into an artificial 429.
@Throttle({ local: RATE_LIMIT_POLICIES.securitySettings })
export class AuthMfaController {
  constructor(
    private readonly startTotpEnrollmentCommand: StartTotpEnrollmentCommand,
    private readonly completeTotpEnrollmentCommand: CompleteTotpEnrollmentCommand,
    private readonly disableTotpCommand: DisableTotpCommand,
    private readonly regenerateRecoveryCodesCommand: RegenerateRecoveryCodesCommand,
    private readonly verifyTotpLoginCommand: VerifyTotpCommand,
    private readonly verifyRecoveryCodeLoginCommand: VerifyRecoveryCodeCommand,
    private readonly getMyMfaConfigurationQuery: GetMyMfaConfigurationQuery,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  @Version('1')
  @Get('mfa/configuration')
  @AppResponse('MFA_CONFIGURATION_RETRIEVED', MfaConfigurationDTO)
  async getMyMfaConfiguration(@User() user: AuthenticatedPrincipalDTO): Promise<MfaConfigurationDTO> {
    return await this.getMyMfaConfigurationQuery.execute(user.sub);
  }

  @Version('1')
  @Post('mfa/enroll/totp/start')
  @AppResponse('TOTP_ENROLLMENT_STARTED', MfaTotpEnrollStartDTO)
  async enrollStart(@User() user: AuthenticatedPrincipalDTO): Promise<MfaTotpEnrollStartDTO> {
    return await this.startTotpEnrollmentCommand.execute(user.sub, user.sid);
  }

  @Version('1')
  @Post('mfa/enroll/totp/complete')
  @AppResponse('TOTP_ENROLLMENT_COMPLETED', MfaTotpEnrollCompleteResponseDTO)
  async enrollComplete(
    @User() user: AuthenticatedPrincipalDTO,
    @Body() body: MfaTotpEnrollCompleteDTO,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<MfaTotpEnrollCompleteResponseDTO> {
    const result = await this.completeTotpEnrollmentCommand.execute({
      ...body,
      userId: user.sub,
      sessionId: user.sid,
      ipAddress: request.ip ?? null,
      userAgent: typeof request.headers['user-agent'] === 'string' ? request.headers['user-agent'] : null,
    });
    setSessionCookie(reply, result.sessionSecret, this.config.secureCookies);

    return { recoveryCodes: result.recoveryCodes };
  }

  @Version('1')
  @Post('mfa/totp/disable')
  @AppResponse('TOTP_DISABLED')
  async disableTotp(
    @User() user: AuthenticatedPrincipalDTO,
    @Body() body: MfaDisableDTO,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<null> {
    await this.disableTotpCommand.execute(user.sub, user.sid, body);
    const sessionSecret = getSessionSecretFromRequest(request);
    if (!sessionSecret) throw new Error('Authenticated request missing Session cookie');
    setSessionCookie(reply, sessionSecret, this.config.secureCookies);

    return null;
  }

  @Version('1')
  @Post('mfa/verify/totp')
  @Throttle({ local: RATE_LIMIT_POLICIES.authSensitive })
  @Public()
  @AppResponse('TOTP_VERIFIED')
  async verifyTotp(
    @Body() body: MfaTotpVerifyDTO,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<null> {
    const result = await this.verifyTotpLoginCommand.execute({
      token: body.token,
      code: body.code,
      deviceName: body.deviceName ?? undefined,
      ipAddress: request.ip ?? null,
      userAgent: typeof request.headers['user-agent'] === 'string' ? request.headers['user-agent'] : null,
    });

    setSessionCookie(reply, result.sessionSecret, this.config.secureCookies);

    return null;
  }

  @Version('1')
  @Post('mfa/verify/recovery-code')
  @Throttle({ local: RATE_LIMIT_POLICIES.authSensitive })
  @Public()
  @AppResponse('RECOVERY_CODE_VERIFIED', MfaRecoveryCodeSessionDTO)
  async verifyRecoveryCode(
    @Body() body: MfaRecoveryCodeVerifyDTO,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<MfaRecoveryCodeSessionDTO> {
    const result = await this.verifyRecoveryCodeLoginCommand.execute({
      token: body.token,
      recoveryCode: body.recoveryCode,
      deviceName: body.deviceName ?? undefined,
      ipAddress: request.ip ?? null,
      userAgent: typeof request.headers['user-agent'] === 'string' ? request.headers['user-agent'] : null,
    });

    setSessionCookie(reply, result.sessionSecret, this.config.secureCookies);

    return {
      recoveryCodeUsed: true,
      remainingCodes: result.remainingCodes,
    };
  }

  @Version('1')
  @Post('mfa/recovery-codes/regenerate')
  @AppResponse('RECOVERY_CODES_REGENERATED', MfaRecoveryCodesDTO)
  async regenerateRecoveryCodes(@User() user: AuthenticatedPrincipalDTO): Promise<MfaRecoveryCodesDTO> {
    return await this.regenerateRecoveryCodesCommand.execute(user.sub, user.sid);
  }
}
