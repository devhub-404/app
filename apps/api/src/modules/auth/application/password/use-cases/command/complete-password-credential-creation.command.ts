import { Inject, Injectable } from '@nestjs/common';
import { OpaquePasswordService } from '@/modules/auth/domain/services/opaque-password.service';
import { CredentialPasswordRepository } from '@/modules/auth/application/password/ports/credential-password.repository';
import { CredentialRepository } from '@/modules/auth/application/password/ports/credential.repository';
import { AppError } from '@/shared/errors/app-error';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import { RequirePossessionProofCommand } from '@/modules/auth/application/auth/use-cases/command/require-possession-proof.command';
import { PasswordCredentialCreatedDTO } from '@/modules/auth/application/password/dtos/out';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import {
  CompletePasswordCredentialCreationInputDTO,
} from '@/modules/auth/application/password/dtos';

@Injectable()
export class CompletePasswordCredentialCreationCommand {
  constructor(
    private readonly opaquePasswordService: OpaquePasswordService,
    private readonly credentialRepository: CredentialRepository,
    private readonly credentialPasswordRepository: CredentialPasswordRepository,
    private readonly requirePossessionProofCommand: RequirePossessionProofCommand,
    @Inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountServicePort,
  ) {}

  async execute(input: CompletePasswordCredentialCreationInputDTO): Promise<PasswordCredentialCreatedDTO> {
    await this.requirePossessionProofCommand.execute(input.userId, input.sessionId);

    const userRow = await this.accountService.getAuthenticationView(input.userId);
    if (!userRow) throw new AppError('USER_NOT_FOUND');
    assertUserCanAuthenticate({
      id: userRow.userId,
      status: userRow.status,
      mfaEnabled: userRow.mfaEnabled,
      lockedUntil: userRow.lockedUntil,
    });

    const existing = await this.credentialPasswordRepository.findByUserId(input.userId);
    if (existing) {
      throw new AppError('AUTH_PASSWORD_ALREADY_SET');
    }

    await this.opaquePasswordService.getServerPublicKey(input.registrationRecord);

    const { id: credentialId } = await this.credentialRepository.createPassword({
      userId: input.userId,
      verifier: input.registrationRecord,
      opaqueUserIdentifier: input.opaqueUserIdentifier,
    });

    return { credentialId };
  }
}
