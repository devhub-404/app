import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { MfaTotpRepository } from '@/modules/auth/application/mfa/ports/mfa-totp.repository';
import { MfaRecoveryCodeRepository } from '@/modules/auth/application/mfa/ports/mfa-recovery-code.repository';
import { AccountAccessPort } from '@/modules/account/public/account-access.ports';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import { TotpService } from '@/modules/auth/domain/services/totp.service';
import { TotpSecretCryptoService } from '@/modules/auth/domain/services/totp-secret-crypto.service';
import { AuthSecretDigestService } from '@/modules/auth/domain/services/auth-secret-digest.service';
import { SessionRepository } from '@/modules/auth/application/sessions/ports/session.repository';
import { nextSessionExpiry } from '@/modules/auth/application/sessions/session-policy';
import { MfaRecoveryCode } from '@/modules/auth/domain/entities/mfa-recovery-code';

@Injectable()
export class DisableTotpCommand {
  constructor(
    private readonly mfaTotpRepository: MfaTotpRepository,
    private readonly mfaRecoveryCodeRepository: MfaRecoveryCodeRepository,
    private readonly userRepository: AccountAccessPort,
    private readonly totpService: TotpService,
    private readonly totpSecretCryptoService: TotpSecretCryptoService,
    private readonly authSecretDigestService: AuthSecretDigestService,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async execute(
    userId: string,
    sessionId: string,
    proof: { method: 'totp' | 'recovery_code'; code: string },
  ): Promise<void> {
    const userRow = await this.userRepository.findById(userId);
    if (!userRow) throw new AppError('USER_NOT_FOUND');
    assertUserCanAuthenticate(userRow);

    const totp = await this.mfaTotpRepository.findByUserId(userId);
    if (!totp || totp.status !== 'active') throw new AppError('AUTH_MFA_NOT_ENABLED');

    const recoveryCodeHash = await this.verifyFreshMfaProof(userId, totp.encryptedSecret, proof);

    // Renew immediately after the fresh factor is proven. If the current
    // Session cannot be renewed, do not mutate MFA state at all.
    const lastProofOfPossessionAt = new Date();
    const renewed = await this.sessionRepository.renewAfterProof(
      userId,
      sessionId,
      lastProofOfPossessionAt,
      nextSessionExpiry(lastProofOfPossessionAt),
    );
    if (!renewed) throw new AppError('AUTH_REQUIRED');

    if (recoveryCodeHash) {
      const consumed = await this.mfaRecoveryCodeRepository.consumeUnusedByUserIdAndHash(userId, recoveryCodeHash);
      if (!consumed) throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    const snapshot = await this.mfaTotpRepository.disableMfa(userId);
    if (!snapshot) throw new AppError('AUTH_MFA_NOT_ENABLED');
    try {
      const updated = await this.userRepository.setMfaEnabled(userId, false);
      if (!updated) throw new AppError('USER_NOT_FOUND');
    } catch (error) {
      await this.mfaTotpRepository.restoreDisabledMfa(snapshot);

      throw error;
    }
  }

  private async verifyFreshMfaProof(
    userId: string,
    encryptedSecret: string,
    proof: { method: 'totp' | 'recovery_code'; code: string },
  ): Promise<string | null> {
    if (proof.method === 'totp') {
      const secret = await this.totpSecretCryptoService.decryptBase32Secret(encryptedSecret);
      if (!this.totpService.verifyToken({ token: proof.code, secret, window: 1 })) {
        throw new AppError('AUTH_INVALID_CREDENTIAL');
      }

      return null;
    }

    const codeHash = await this.authSecretDigestService.hash(proof.code);
    const available = await this.mfaRecoveryCodeRepository.findUnusedByUserIdAndHash(userId, codeHash);
    if (!available) throw new AppError('AUTH_INVALID_CREDENTIAL');
    MfaRecoveryCode.rehydrate(available).consume();

    return codeHash;
  }
}
