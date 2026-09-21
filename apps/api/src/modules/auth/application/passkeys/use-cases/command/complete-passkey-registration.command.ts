import { Inject, Injectable } from '@nestjs/common';
import { PasskeyService } from '@/modules/auth/domain/services/passkey.service';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { PasskeyStateTokenDTO } from '@/modules/auth/application/shared/dto';
import { CredentialRepository } from '@/modules/auth/application/shared/ports/credential.repository';
import { AppError } from '@/shared/errors/app-error';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { RequirePossessionProofCommand } from '@/modules/auth/application/auth/use-cases/command/require-possession-proof.command';
import { PasskeyRegisteredDTO } from '@/modules/auth/application/passkeys/dtos/out';
import { CompletePasskeyRegistrationInputDTO } from '@/modules/auth/application/passkeys/dtos/in';

@Injectable()
export class CompletePasskeyRegistrationCommand {
  constructor(
    private readonly passkeyService: PasskeyService,
    private readonly flowTokenService: FlowTokenService,
    private readonly credentialRepository: CredentialRepository,
    private readonly requirePossessionProofCommand: RequirePossessionProofCommand,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  async execute(input: CompletePasskeyRegistrationInputDTO): Promise<PasskeyRegisteredDTO> {
    await this.requirePossessionProofCommand.execute(input.userId, input.sessionId);

    const tokenPayload = await this.flowTokenService.verifySingleUse(
      PasskeyStateTokenDTO,
      input.stateToken,
      'passkey_state',
    );

    if (tokenPayload.action !== 'register' || !tokenPayload.userId || tokenPayload.userId !== input.userId) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    const verification = await this.passkeyService.verifyRegistrationResponse({
      response: input.response,
      expectedChallenge: tokenPayload.challenge,
      expectedOrigin: this.config.auth.passkeyOrigin,
      expectedRPID: this.config.auth.passkeyRpId,
    });

    if (!verification.verified || !verification.registration) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    if (!(await this.flowTokenService.consumeSingleUse(tokenPayload, 'passkey_state'))) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    const result = verification.registration;
    const userId = tokenPayload.userId;

    const { id: credentialId } = await this.credentialRepository.createPasskey({
      userId,
      webauthnId: result.webauthnId,
      publicKey: result.publicKey,
      counter: result.counter,
      deviceType: result.deviceType,
      backedUp: result.backedUp,
      transports: result.transports ?? null,
      deviceName: input.deviceName ?? null,
    });

    return { credentialId };
  }
}
