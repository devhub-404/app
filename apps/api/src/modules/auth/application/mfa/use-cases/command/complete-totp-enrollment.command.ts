import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { DomainError } from '@/shared/errors/domain-error';
import { AccountAccessPort } from '@/modules/account/public/account-access.ports';
import { MfaTotpRepository } from '@/modules/auth/application/mfa/ports/mfa-totp.repository';
import { AuthSecretDigestService } from '@/modules/auth/domain/services/auth-secret-digest.service';
import { TotpService } from '@/modules/auth/domain/services/totp.service';
import { TotpSecretCryptoService } from '@/modules/auth/domain/services/totp-secret-crypto.service';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import { RequirePossessionProofCommand } from '@/modules/auth/application/auth/use-cases/command/require-possession-proof.command';
import { IssueSessionCommand } from '@/modules/auth/application/sessions/use-cases/command/issue-session.command';
import { RevokeAllSessionsCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-all-sessions.command';
import { SessionRepository } from '@/modules/auth/application/sessions/ports/session.repository';
import { MfaTotp } from '@/modules/auth/domain/entities/mfa-totp';
import { CompleteTotpEnrollmentInputDTO, CompleteTotpEnrollmentResultDTO } from '@/modules/auth/application/mfa/dtos';

@Injectable()
export class CompleteTotpEnrollmentCommand {
  constructor(
    private readonly totpService: TotpService,
    private readonly totpSecretCryptoService: TotpSecretCryptoService,
    private readonly mfaTotpRepository: MfaTotpRepository,
    private readonly authSecretDigestService: AuthSecretDigestService,
    private readonly userRepository: AccountAccessPort,
    private readonly requirePossessionProofCommand: RequirePossessionProofCommand,
    private readonly issueSessionCommand: IssueSessionCommand,
    private readonly revokeAllSessionsCommand: RevokeAllSessionsCommand,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(input: CompleteTotpEnrollmentInputDTO): Promise<CompleteTotpEnrollmentResultDTO> {
    await this.requirePossessionProofCommand.execute(input.userId, input.sessionId, null, 'standard');

    const currentSession = await this.sessionRepository.findActiveById(input.userId, input.sessionId);
    if (!currentSession) throw new AppError('AUTH_REQUIRED');

    const userRow = await this.userRepository.findById(input.userId);
    if (!userRow) {
      throw new AppError('USER_NOT_FOUND');
    }

    assertUserCanAuthenticate(userRow);

    const totp = await this.mfaTotpRepository.findByUserId(input.userId);
    if (!totp) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }
    const enrollment = MfaTotp.rehydrate(totp);
    try {
      enrollment.activate();
    } catch (error) {
      if (error instanceof DomainError) throw new AppError(error.code);

      throw error;
    }

    const secret = await this.totpSecretCryptoService.decryptBase32Secret(totp.encryptedSecret);
    const valid = this.totpService.verifyToken({ token: input.code, secret, window: 1 });
    if (!valid) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    const recoveryCodes = this.totpService.generateBackupCodes({ count: 10 });
    const recoveryCodeHashes = await Promise.all(recoveryCodes.map((item) => this.authSecretDigestService.hash(item)));

    const activated = await this.mfaTotpRepository.activateEnrollment(input.userId, recoveryCodeHashes);
    if (!activated) throw new AppError('AUTH_INVALID_CREDENTIAL');
    try {
      const updated = await this.userRepository.setMfaEnabled(input.userId, true);
      if (!updated) throw new AppError('USER_NOT_FOUND');
    } catch (error) {
      await this.mfaTotpRepository.disableMfa(input.userId);

      throw error;
    }

    // Once MFA becomes authoritative, pre-enrollment persisted Sessions are no
    // longer renewable. The replacement Session is created only after TOTP was
    // verified successfully.
    await this.revokeAllSessionsCommand.execute(input.userId);

    const { sessionSecret } = await this.issueSessionCommand.execute({
      userId: input.userId,
      authMethod: currentSession.authMethod,
      mfaVerified: true,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      deviceName: input.deviceName ?? null,
    });

    return { recoveryCodes, sessionSecret };
  }
}
