import { Inject, Injectable } from '@nestjs/common';
import { PasskeyService } from '@/modules/auth/domain/services/passkey.service';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { CredentialPasskeyRepository } from '@/modules/auth/application/passkeys/ports/credential-passkey.repository';
import { AccountUserQueryPort } from '@/modules/account/public/account-access.ports';
import { JwtTokenType } from '@/modules/auth/application/shared/dto';
import { AppError } from '@/shared/errors/app-error';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import { RequirePossessionProofCommand } from '@/modules/auth/application/auth/use-cases/command/require-possession-proof.command';
import { PasskeyChallengeDTO } from '@/modules/auth/application/passkeys/dtos/out';
import { StartPasskeyRegistrationInputDTO } from '@/modules/auth/application/passkeys/dtos/in';

@Injectable()
export class StartPasskeyRegistrationCommand {
  constructor(
    private readonly passkeyService: PasskeyService,
    private readonly flowTokenService: FlowTokenService,
    private readonly credentialPasskeyRepository: CredentialPasskeyRepository,
    private readonly userQueryRepository: AccountUserQueryPort,
    private readonly requirePossessionProofCommand: RequirePossessionProofCommand,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  async execute(input: StartPasskeyRegistrationInputDTO): Promise<PasskeyChallengeDTO> {
    await this.requirePossessionProofCommand.execute(input.userId, input.sessionId);

    const existingIds = await this.credentialPasskeyRepository.listWebauthnIdsByUserId(input.userId);

    const user = await this.userQueryRepository.findById(input.userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND');
    }
    assertUserCanAuthenticate(user);
    if (user.deletedAt) {
      throw new AppError('USER_CANNOT_AUTHENTICATE');
    }

    const primaryEmail = await this.userQueryRepository.findPrimaryEmailByUserId(input.userId);
    if (!primaryEmail || !primaryEmail.verifiedAt) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    const result = await this.passkeyService.generateRegistrationOptions({
      rpID: this.config.auth.passkeyRpId,
      rpName: this.config.auth.passkeyRpName,
      userID: input.userId,
      userName: user.id,
      excludeCredentialIDs: existingIds,
    });

    const stateToken = await this.flowTokenService.signSingleUse({
      type: JwtTokenType.PASSKEY_STATE,
      purpose: 'passkey_state',
      payload: { action: 'register', challenge: result.challenge, userId: input.userId },
      expiresIn: '10m',
    });

    return { options: result.options, stateToken };
  }
}
