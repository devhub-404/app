import { Inject, Injectable } from '@nestjs/common';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { OpaquePasswordService } from '@/modules/auth/domain/services/opaque-password.service';
import { CredentialPasswordRepository } from '@/modules/auth/application/password/ports/credential-password.repository';
import { PasswordResetTokenDTO } from '@/modules/auth/application/shared/dto';
import { AppError } from '@/shared/errors/app-error';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import { RevokeAllSessionsCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-all-sessions.command';
import { PasswordRecoveryCompletedDTO } from '@/modules/auth/application/password/dtos/out';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import { PasswordCredential } from '@/modules/auth/domain/entities/password-credential';
import { CompletePasswordRecoveryInputDTO } from '@/modules/auth/application/password/dtos';

@Injectable()
export class CompletePasswordRecoveryCommand {
  constructor(
    private readonly flowTokenService: FlowTokenService,
    private readonly opaquePasswordService: OpaquePasswordService,
    private readonly credentialPasswordRepository: CredentialPasswordRepository,
    private readonly revokeAllSessionsCommand: RevokeAllSessionsCommand,
    @Inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountServicePort,
  ) {}

  async execute(input: CompletePasswordRecoveryInputDTO): Promise<PasswordRecoveryCompletedDTO> {
    // 1. Verify the password reset token
    const payload = await this.flowTokenService.verifySingleUse(PasswordResetTokenDTO, input.token, 'password_reset');

    // 2. Ensure user can authenticate (suspended/banned users should not recover passwords)
    const userRow = await this.accountService.getAuthenticationView(payload.sub);
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

    // 3. Find existing password credential
    const credentialPassword = await this.credentialPasswordRepository.findByUserId(payload.sub);
    if (!credentialPassword) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }
    const credential = PasswordCredential.rehydrate(credentialPassword);

    // 4. Validate and store the new OPAQUE verifier.
    await this.opaquePasswordService.getServerPublicKey(input.registrationRecord);
    if (!(await this.flowTokenService.consumeSingleUse(payload, 'password_reset'))) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }
    credential.replaceVerifier(input.registrationRecord);
    await this.credentialPasswordRepository.updateVerifier(credential.id, credential.verifier);

    // 5. Reset failed attempts and clear any lock
    await this.credentialPasswordRepository.resetFailedAttempts(credentialPassword.credentialId);
    await this.credentialPasswordRepository.setLockedUntil(credentialPassword.credentialId, null);

    // 6. Revoke all active sessions for security
    await this.revokeAllSessionsCommand.execute(payload.sub);

    return { recovered: true };
  }
}
