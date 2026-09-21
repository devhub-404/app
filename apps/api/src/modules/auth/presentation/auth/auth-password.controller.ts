import { Body, Controller, Post, Req, Res, UseGuards, Version } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LocalRateLimitGuard, RATE_LIMIT_POLICIES } from '@/app/runtime/rate-limit';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { Public } from '@/shared/nest/decorators/public';
import { User } from '@/modules/auth/public/http';
import type { AuthenticatedPrincipalDTO } from '@/modules/auth/public/http';
import {
  PasswordLoginFinishDTO,
  PasswordLoginStartDTO,
  PasswordRegisterFinishDTO,
  PasswordRegisterStartDTO,
  PasswordCredentialCreateStartDTO,
  PasswordCredentialCreateCompleteDTO,
  PasswordChangeCompleteDTO,
  PasswordChangeStartDTO,
  PasswordRecoverCompleteDTO,
  PasswordRecoverStartDTO,
  PasswordRecoverPrepareDTO,
} from '@/modules/auth/application/password/dtos/in';
import {
  PasswordChangedDTO,
  PasswordCredentialCreatedDTO,
  PasswordLoginStartResponseDTO,
  PasswordRecoveryCompletedDTO,
  PasswordRegistrationCompletedDTO,
  PasswordRegisterStartResponseDTO,
  PasswordChangeStartResponseDTO,
  PasswordLoginCompleteDTO,
  PasswordRecoverPrepareResponseDTO,
} from '@/modules/auth/application/password/dtos/out';
import { GenericPublicAckDTO } from '@/modules/auth/public/http';
import { StartPasswordRegistrationCommand } from '@/modules/auth/application/password/use-cases/command/start-password-registration.command';
import { CompletePasswordRegistrationCommand } from '@/modules/auth/application/password/use-cases/command/complete-password-registration.command';
import { StartPasswordChangeCommand } from '@/modules/auth/application/password/use-cases/command/start-password-change.command';
import { CompletePasswordChangeCommand } from '@/modules/auth/application/password/use-cases/command/complete-password-change.command';
import { StartPasswordCredentialCreationCommand } from '@/modules/auth/application/password/use-cases/command/start-password-credential-creation.command';
import { CompletePasswordCredentialCreationCommand } from '@/modules/auth/application/password/use-cases/command/complete-password-credential-creation.command';
import { StartPasswordLoginCommand } from '@/modules/auth/application/password/use-cases/command/start-password-login.command';
import { CompletePasswordLoginCommand } from '@/modules/auth/application/password/use-cases/command/complete-password-login.command';
import { StartPasswordRecoveryCommand } from '@/modules/auth/application/password/use-cases/command/start-password-recovery.command';
import { CompletePasswordRecoveryCommand } from '@/modules/auth/application/password/use-cases/command/complete-password-recovery.command';
import { PreparePasswordRecoveryCommand } from '@/modules/auth/application/password/use-cases/command/prepare-password-recovery.command';
import { getSessionSecretFromRequest, setSessionCookie } from '@/modules/auth/presentation/utils/auth-cookies.util';
import { Inject } from '@nestjs/common';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';

@Controller()
@UseGuards(AuthGuard, LocalRateLimitGuard)
@Throttle({ local: RATE_LIMIT_POLICIES.authInteractive })
export class AuthPasswordController {
  constructor(
    private readonly startPasswordRegistrationCommand: StartPasswordRegistrationCommand,
    private readonly completePasswordRegistrationCommand: CompletePasswordRegistrationCommand,
    private readonly startPasswordLoginCommand: StartPasswordLoginCommand,
    private readonly completePasswordLoginCommand: CompletePasswordLoginCommand,
    private readonly startPasswordRecoveryCommand: StartPasswordRecoveryCommand,
    private readonly completePasswordRecoveryCommand: CompletePasswordRecoveryCommand,
    private readonly preparePasswordRecoveryCommand: PreparePasswordRecoveryCommand,
    private readonly startPasswordChangeCommand: StartPasswordChangeCommand,
    private readonly completePasswordChangeCommand: CompletePasswordChangeCommand,
    private readonly startPasswordCredentialCreateCommand: StartPasswordCredentialCreationCommand,
    private readonly completePasswordCredentialCreateCommand: CompletePasswordCredentialCreationCommand,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  @Version('1')
  @Post('register/password/start')
  @Throttle({ local: RATE_LIMIT_POLICIES.authEmail })
  @Public()
  @AppResponse('PASSWORD_REGISTRATION_STARTED', PasswordRegisterStartResponseDTO)
  async startPasswordRegistration(@Body() body: PasswordRegisterStartDTO): Promise<PasswordRegisterStartResponseDTO> {
    return await this.startPasswordRegistrationCommand.execute(body);
  }

  @Version('1')
  @Post('register/password/complete')
  @Public()
  @AppResponse('PASSWORD_REGISTRATION_COMPLETED', PasswordRegistrationCompletedDTO)
  async completePasswordRegistration(
    @Body() body: PasswordRegisterFinishDTO,
    @Req() request: FastifyRequest,
  ): Promise<PasswordRegistrationCompletedDTO> {
    return await this.completePasswordRegistrationCommand.execute({
      email: body.email,
      registrationRecord: body.registrationRecord,
      opaqueUserIdentifier: body.opaqueUserIdentifier,
      ipAddress: request.ip ?? null,
      userAgent: typeof request.headers['user-agent'] === 'string' ? request.headers['user-agent'] : null,
    });
  }

  @Version('1')
  @Post('login/password/start')
  @Public()
  @AppResponse('PASSWORD_LOGIN_STARTED', PasswordLoginStartResponseDTO)
  async startPasswordLogin(@Body() body: PasswordLoginStartDTO): Promise<PasswordLoginStartResponseDTO> {
    const result = await this.startPasswordLoginCommand.execute(body);

    return {
      serverLoginState: result.serverLoginState,
      loginResponse: result.loginResponse,
    };
  }

  @Version('1')
  @Post('login/password/complete')
  @Public()
  @AppResponse('PASSWORD_LOGIN_COMPLETED', PasswordLoginCompleteDTO, { nullable: true })
  async completePasswordLogin(
    @Body() body: PasswordLoginFinishDTO,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<PasswordLoginCompleteDTO | null> {
    const result = await this.completePasswordLoginCommand.execute({
      email: body.email,
      serverLoginState: body.serverLoginState,
      finishLoginRequest: body.finishLoginRequest,
      ipAddress: request.ip ?? null,
      userAgent: typeof request.headers['user-agent'] === 'string' ? request.headers['user-agent'] : null,
      deviceName: body.deviceName ?? undefined,
    });

    if ('restoreAccessRequested' in result) {
      return { restoreAccessRequested: true };
    }

    if ('mfaRequired' in result) {
      return { mfaRequired: true, token: result.token, methods: result.methods };
    }

    if ('emailVerificationRequested' in result) {
      return result;
    }

    if ('reactivationRequired' in result) {
      return { reactivationToken: result.token };
    }

    if (!result.sessionSecret) throw new Error('Password login did not produce a session secret');
    setSessionCookie(reply, result.sessionSecret, this.config.secureCookies);

    return {};
  }

  @Version('1')
  @Post('recover/password/start')
  @Throttle({ local: RATE_LIMIT_POLICIES.authEmail })
  @Public()
  @AppResponse('PASSWORD_RECOVERY_ACKNOWLEDGED', GenericPublicAckDTO)
  async startPasswordRecovery(@Body() body: PasswordRecoverStartDTO): Promise<GenericPublicAckDTO> {
    return await this.startPasswordRecoveryCommand.execute(body);
  }

  @Version('1')
  @Post('recover/password/complete')
  @Public()
  @AppResponse('PASSWORD_RECOVERY_COMPLETED', PasswordRecoveryCompletedDTO)
  async completePasswordRecovery(@Body() body: PasswordRecoverCompleteDTO): Promise<PasswordRecoveryCompletedDTO> {
    return await this.completePasswordRecoveryCommand.execute(body);
  }

  @Version('1')
  @Post('recover/password/prepare')
  @Public()
  @AppResponse('PASSWORD_RECOVERY_PREPARED', PasswordRecoverPrepareResponseDTO)
  async preparePasswordRecovery(@Body() body: PasswordRecoverPrepareDTO): Promise<PasswordRecoverPrepareResponseDTO> {
    return await this.preparePasswordRecoveryCommand.execute(body);
  }

  @Version('1')
  @Post('change/password/start')
  @AppResponse('PASSWORD_CHANGE_STARTED', PasswordChangeStartResponseDTO)
  async startPasswordChange(
    @Body() body: PasswordChangeStartDTO,
    @User() user: AuthenticatedPrincipalDTO,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<PasswordChangeStartResponseDTO> {
    const result = await this.startPasswordChangeCommand.execute({
      userId: user.sub,
      sessionId: user.sid,
      serverLoginState: body.serverLoginState,
      finishLoginRequest: body.finishLoginRequest,
      registrationRequest: body.registrationRequest,
    });
    const sessionSecret = getSessionSecretFromRequest(request);
    if (!sessionSecret) throw new Error('Authenticated request missing Session cookie');
    setSessionCookie(reply, sessionSecret, this.config.secureCookies);

    return result;
  }

  @Version('1')
  @Post('change/password/complete')
  @AppResponse('PASSWORD_CHANGED', PasswordChangedDTO)
  async completePasswordChange(
    @Body() body: PasswordChangeCompleteDTO,
    @User() user: AuthenticatedPrincipalDTO,
  ): Promise<PasswordChangedDTO> {
    return await this.completePasswordChangeCommand.execute({
      userId: user.sub,
      sessionId: user.sid,
      changeToken: body.changeToken,
      registrationRecord: body.registrationRecord,
    });
  }

  @Version('1')
  @Post('credentials/password/start')
  @AppResponse('PASSWORD_CREDENTIAL_CREATE_STARTED', PasswordRegisterStartResponseDTO)
  async startPasswordCredentialCreate(
    @Body() body: PasswordCredentialCreateStartDTO,
    @User() user: AuthenticatedPrincipalDTO,
  ): Promise<PasswordRegisterStartResponseDTO> {
    return await this.startPasswordCredentialCreateCommand.execute({
      ...body,
      userId: user.sub,
      sessionId: user.sid,
    });
  }

  @Version('1')
  @Post('credentials/password/complete')
  @AppResponse('PASSWORD_CREDENTIAL_CREATED', PasswordCredentialCreatedDTO)
  async completePasswordCredentialCreate(
    @Body() body: PasswordCredentialCreateCompleteDTO,
    @User() user: AuthenticatedPrincipalDTO,
  ): Promise<PasswordCredentialCreatedDTO> {
    return await this.completePasswordCredentialCreateCommand.execute({
      ...body,
      userId: user.sub,
      sessionId: user.sid,
    });
  }
}
