import { Inject, Injectable } from '@nestjs/common';
import { OpaquePasswordService } from '@/modules/auth/domain/services/opaque-password.service';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { CredentialPasswordRepository } from '@/modules/auth/application/password/ports/credential-password.repository';
import { PasswordChangeTokenDTO } from '@/modules/auth/application/shared/dto';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import { AppError } from '@/shared/errors/app-error';
import { RevokeOtherSessionsCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-other-sessions.command';
import { PasswordChangedDTO } from '@/modules/auth/application/password/dtos/out';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import { PasswordCredential } from '@/modules/auth/domain/entities/password-credential';
import { CompletePasswordChangeInputDTO } from '@/modules/auth/application/password/dtos';

@Injectable()
export class CompletePasswordChangeCommand {
  constructor(
    private readonly opaquePasswordService: OpaquePasswordService,
    private readonly flowTokenService: FlowTokenService,
    private readonly credentialPasswordRepository: CredentialPasswordRepository,
    private readonly revokeOtherSessionsCommand: RevokeOtherSessionsCommand,
    @Inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountServicePort,
  ) {}

  async execute(input: CompletePasswordChangeInputDTO): Promise<PasswordChangedDTO> {
    const userRow = await this.accountService.getAuthenticationView(input.userId);
    if (!userRow) throw new AppError('USER_NOT_FOUND');
    if (userRow.deletedAt) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }
    assertUserCanAuthenticate({
      id: userRow.userId,
      status: userRow.status,
      mfaEnabled: userRow.mfaEnabled,
      lockedUntil: userRow.lockedUntil,
    });

    // 1. Verify the password change token
    const payload = await this.flowTokenService.verifySingleUse(
      PasswordChangeTokenDTO,
      input.changeToken,
      'password_change',
    );

    // 2. Find existing password credential
    const credentialPassword = await this.credentialPasswordRepository.findByUserId(payload.sub);
    if (!credentialPassword) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    if (payload.sub !== input.userId) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    if (payload.credentialId && payload.credentialId !== credentialPassword.credentialId) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }
    const credential = PasswordCredential.rehydrate(credentialPassword);

    // 3. Validate and update the OPAQUE verifier
    await this.opaquePasswordService.getServerPublicKey(input.registrationRecord);
    if (!(await this.flowTokenService.consumeSingleUse(payload, 'password_change'))) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }
    credential.replaceVerifier(input.registrationRecord);
    await this.credentialPasswordRepository.updateVerifier(credential.id, credential.verifier);

    // 4. Reset failed attempts
    await this.credentialPasswordRepository.resetFailedAttempts(credentialPassword.credentialId);

    // 5. Keep the current session and revoke all others.
    await this.revokeOtherSessionsCommand.execute(input.userId, input.sessionId);

    return { changed: true };
  }
}
