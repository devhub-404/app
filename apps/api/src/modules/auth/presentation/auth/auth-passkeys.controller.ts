import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards, Version } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LocalRateLimitGuard, RATE_LIMIT_POLICIES } from '@/app/runtime/rate-limit';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { Public } from '@/shared/nest/decorators/public';
import { User } from '@/modules/auth/public/http';
import type { AuthenticatedPrincipalDTO } from '@/modules/auth/public/http';
import { StartPasskeyLoginCommand } from '@/modules/auth/application/passkeys/use-cases/command/start-passkey-login.command';
import { CompletePasskeyLoginCommand } from '@/modules/auth/application/passkeys/use-cases/command/complete-passkey-login.command';
import { StartPasskeyRegistrationCommand } from '@/modules/auth/application/passkeys/use-cases/command/start-passkey-registration.command';
import { CompletePasskeyRegistrationCommand } from '@/modules/auth/application/passkeys/use-cases/command/complete-passkey-registration.command';
import { UpdatePasskeyDeviceNameCommand } from '@/modules/auth/application/passkeys/use-cases/command/update-passkey-device-name.command';
import { DeleteCredentialCommand } from '@/modules/auth/application/passkeys/use-cases/command/delete-credential.command';
import { ListPasskeyDevicesQuery } from '@/modules/auth/application/passkeys/use-cases/query/list-passkey-devices.query';
import {
  CompletePasskeyLoginDTO,
  CompletePasskeyRegistrationDTO,
  UpdatePasskeyDeviceNameDTO,
} from '@/modules/auth/application/passkeys/dtos/in';
import {
  PasskeyChallengeDTO,
  PasskeyLoginDTO,
  PasskeyRegisteredDTO,
  PasskeyDeviceDTO,
} from '@/modules/auth/application/passkeys/dtos/out';
import { setSessionCookie } from '@/modules/auth/presentation/utils/auth-cookies.util';
import { Inject } from '@nestjs/common';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';

@Controller()
@UseGuards(AuthGuard, LocalRateLimitGuard)
@Throttle({ local: RATE_LIMIT_POLICIES.securitySettings })
export class AuthPasskeysController {
  constructor(
    private readonly startPasskeyLoginCommand: StartPasskeyLoginCommand,
    private readonly completePasskeyLoginCommand: CompletePasskeyLoginCommand,
    private readonly startPasskeyRegistrationCommand: StartPasskeyRegistrationCommand,
    private readonly completePasskeyRegistrationCommand: CompletePasskeyRegistrationCommand,
    private readonly updatePasskeyDeviceNameCommand: UpdatePasskeyDeviceNameCommand,
    private readonly deleteCredentialCommand: DeleteCredentialCommand,
    private readonly listPasskeyDevicesQuery: ListPasskeyDevicesQuery,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  @Version('1')
  @Get('credentials/passkeys')
  @AppResponse('PASSKEY_DEVICES_LISTED', PasskeyDeviceDTO, { isArray: true })
  async listPasskeyDevices(@User() user: AuthenticatedPrincipalDTO): Promise<PasskeyDeviceDTO[]> {
    return await this.listPasskeyDevicesQuery.execute(user.sub);
  }

  @Version('1')
  @Post('login/passkey/start')
  @Public()
  @AppResponse('PASSKEY_LOGIN_STARTED', PasskeyChallengeDTO)
  async startPasskeyLogin(): Promise<PasskeyChallengeDTO> {
    return await this.startPasskeyLoginCommand.execute();
  }

  @Version('1')
  @Post('login/passkey/complete')
  @Public()
  @AppResponse('PASSKEY_LOGIN_COMPLETED', PasskeyLoginDTO, { nullable: true })
  async completePasskeyLogin(
    @Body() body: CompletePasskeyLoginDTO,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<PasskeyLoginDTO | { mfaRequired: true; token: string; methods: string[] } | null> {
    const result = await this.completePasskeyLoginCommand.execute({
      stateToken: body.stateToken,
      response: body.response,
      deviceName: body.deviceName ?? undefined,
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

    if (!result.sessionSecret) throw new Error('Passkey login did not produce a session secret');
    setSessionCookie(reply, result.sessionSecret, this.config.secureCookies);

    return {};
  }

  @Version('1')
  @Post('register/passkey/start')
  @AppResponse('PASSKEY_REGISTRATION_STARTED', PasskeyChallengeDTO)
  async startPasskeyRegistration(@User() user: AuthenticatedPrincipalDTO): Promise<PasskeyChallengeDTO> {
    return await this.startPasskeyRegistrationCommand.execute({ userId: user.sub, sessionId: user.sid });
  }

  @Version('1')
  @Post('register/passkey/complete')
  @AppResponse('PASSKEY_REGISTERED', PasskeyRegisteredDTO)
  async completePasskeyRegistration(
    @Body() body: CompletePasskeyRegistrationDTO,
    @User() user: AuthenticatedPrincipalDTO,
  ): Promise<PasskeyRegisteredDTO> {
    return await this.completePasskeyRegistrationCommand.execute({
      userId: user.sub,
      sessionId: user.sid,
      stateToken: body.stateToken,
      response: body.response,
      deviceName: body.deviceName ?? undefined,
    });
  }

  @Version('1')
  @Patch('credentials/passkeys/:credentialId')
  @AppResponse('PASSKEY_DEVICE_NAME_UPDATED')
  async updatePasskeyDeviceName(
    @Param('credentialId') credentialId: string,
    @Body() body: UpdatePasskeyDeviceNameDTO,
    @User() user: AuthenticatedPrincipalDTO,
  ): Promise<null> {
    await this.updatePasskeyDeviceNameCommand.execute(user.sub, credentialId, body.deviceName);

    return null;
  }

  @Version('1')
  @Delete('credentials/:credentialId')
  @AppResponse('CREDENTIAL_DELETED')
  async deleteCredential(
    @Param('credentialId') credentialId: string,
    @User() user: AuthenticatedPrincipalDTO,
  ): Promise<null> {
    await this.deleteCredentialCommand.execute(user.sub, user.sid, credentialId);

    return null;
  }
}
