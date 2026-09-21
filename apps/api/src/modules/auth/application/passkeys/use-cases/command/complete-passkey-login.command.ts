import { Inject, Injectable } from '@nestjs/common';
import { PasskeyService } from '@/modules/auth/domain/services/passkey.service';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { PasskeyStateTokenDTO } from '@/modules/auth/application/shared/dto';
import { CredentialPasskeyRepository } from '@/modules/auth/application/passkeys/ports/credential-passkey.repository';
import { CredentialRepository } from '@/modules/auth/application/shared/ports/credential.repository';
import { AccountAccessPort } from '@/modules/account/public/account-access.ports';
import { AppError } from '@/shared/errors/app-error';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import { HandleAuthenticatedLoginCommand } from '@/modules/auth/application/auth/use-cases/command/handle-authenticated-login.command';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import {
  CompletePasskeyLoginInputDTO,
  CompletePasskeyLoginResultDTO,
} from '@/modules/auth/application/passkeys/dtos';

@Injectable()
export class CompletePasskeyLoginCommand {
  constructor(
    private readonly passkeyService: PasskeyService,
    private readonly flowTokenService: FlowTokenService,
    private readonly credentialPasskeyRepository: CredentialPasskeyRepository,
    private readonly credentialRepository: CredentialRepository,
    private readonly userRepository: AccountAccessPort,
    private readonly handleAuthenticatedUserCommand: HandleAuthenticatedLoginCommand,
    @Inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountServicePort,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  async execute(
    input: CompletePasskeyLoginInputDTO,
  ): Promise<CompletePasskeyLoginResultDTO> {
    const tokenPayload = await this.flowTokenService.verifySingleUse(
      PasskeyStateTokenDTO,
      input.stateToken,
      'passkey_state',
    );

    if (tokenPayload.action !== 'login') {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    const webauthnId = (input.response as { id?: string }).id;
    if (!webauthnId) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    const passkey = await this.credentialPasskeyRepository.findByWebauthnId(webauthnId);
    if (!passkey) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    const userId = passkey.userId;

    const userRow = await this.accountService.getAuthenticationView(userId);
    if (!userRow) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }
    try {
      assertUserCanAuthenticate({
        id: userRow.userId,
        status: userRow.status,
        mfaEnabled: userRow.mfaEnabled,
        lockedUntil: userRow.lockedUntil,
      });
    } catch {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    const verification = await this.passkeyService.verifyAuthenticationResponse({
      response: input.response,
      expectedChallenge: tokenPayload.challenge,
      expectedOrigin: this.config.auth.passkeyOrigin,
      expectedRPID: this.config.auth.passkeyRpId,
      credential: {
        id: passkey.webauthnId,
        publicKey: Buffer.from(passkey.publicKey, 'base64'),
        counter: passkey.counter,
      },
    });

    if (!verification.verified) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    if (!(await this.flowTokenService.consumeSingleUse(tokenPayload, 'passkey_state'))) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    if (verification.newCounter !== undefined && verification.newCounter > passkey.counter) {
      await this.credentialPasskeyRepository.updateCounter(passkey.credentialId, verification.newCounter);
    }

    await this.credentialRepository.updateLastUsedAt(passkey.credentialId);

    const primaryEmail = await this.userRepository.findPrimaryEmailByUserId(userId);
    if (!primaryEmail) {
      throw new AppError('USER_NOT_FOUND');
    }

    if (userRow.deletedAt) {
      return await this.handleAuthenticatedUserCommand.execute({
        userId,
        email: primaryEmail.email,
        credentialId: passkey.credentialId,
        authMethod: 'passkey',
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        deviceName: input.deviceName,
      });
    }

    try {
      return await this.handleAuthenticatedUserCommand.execute({
        userId,
        email: primaryEmail.email,
        credentialId: passkey.credentialId,
        authMethod: 'passkey',
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        deviceName: input.deviceName,
      });
    } catch {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }
  }
}
