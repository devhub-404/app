import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { OpaquePasswordService } from '@/modules/auth/domain/services/opaque-password.service';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { PossessionProofVerifiedDTO } from '@/modules/auth/application/auth/dtos/out';
import { CredentialPasswordRepository } from '@/modules/auth/application/password/ports/credential-password.repository';
import { SessionRepository } from '@/modules/auth/application/sessions/ports/session.repository';
import { AccountEmailAccessPort } from '@/modules/account/public/account-access.ports';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import { HandleFailedLoginCommand } from '@/modules/auth/application/auth/use-cases/command/handle-failed-login.command';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import { nextSessionExpiry } from '@/modules/auth/application/sessions/session-policy';
import { MfaTotpRepository } from '@/modules/auth/application/mfa/ports/mfa-totp.repository';
import { MfaRecoveryCodeRepository } from '@/modules/auth/application/mfa/ports/mfa-recovery-code.repository';
import { TotpService } from '@/modules/auth/domain/services/totp.service';
import { TotpSecretCryptoService } from '@/modules/auth/domain/services/totp-secret-crypto.service';
import { AuthSecretDigestService } from '@/modules/auth/domain/services/auth-secret-digest.service';

const RECENT_AUTH_WINDOW_MS = 15 * 60 * 1000;
export type PossessionProofAssurance = 'standard' | 'current' | 'mfa';

@Injectable()
export class VerifyPossessionProofCommand {
  constructor(
    @Inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountServicePort,
    private readonly opaquePasswordService: OpaquePasswordService,
    private readonly credentialPasswordRepository: CredentialPasswordRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly userEmailRepository: AccountEmailAccessPort,
    private readonly flowTokenService: FlowTokenService,
    private readonly handleFailedAttemptCommand: HandleFailedLoginCommand,
    private readonly mfaTotpRepository: MfaTotpRepository,
    private readonly mfaRecoveryCodeRepository: MfaRecoveryCodeRepository,
    private readonly totpService: TotpService,
    private readonly totpSecretCryptoService: TotpSecretCryptoService,
    private readonly authSecretDigestService: AuthSecretDigestService,
  ) {}

  async execute(
    userId: string,
    sessionId: string,
    options?: {
      emailCode?: string | null;
      currentPassword?: { serverLoginState: string; finishLoginRequest: string } | null;
      requireCurrentPassword?: boolean;
      requiredAssurance?: PossessionProofAssurance;
      mfa?: { method: 'totp' | 'recovery_code'; code: string };
    },
  ): Promise<PossessionProofVerifiedDTO> {
    const user = await this.accountService.getAuthenticationView(userId);
    if (!user || user.status !== 'active' || user.lockedUntil || user.deletedAt) return { accepted: false };

    const requiredAssurance = options?.requiredAssurance ?? 'standard';
    const requiresMfa = requiredAssurance === 'mfa' || (requiredAssurance === 'current' && user.mfaEnabled);
    const session = await this.sessionRepository.findActiveById(userId, sessionId);
    const recent = !!session && Date.now() - session.lastProofOfPossessionAt.getTime() <= RECENT_AUTH_WINDOW_MS;
    const recentMfa = recent && user.mfaEnabled;

    // Password change intentionally requires the current password in addition to
    // whatever assurance protects the account today.
    if (options?.requireCurrentPassword) {
      if (!options.currentPassword) throw new AppError('AUTH_REQUIRED');
      const password = await this.verifyCurrentPassword(
        userId,
        options.currentPassword.serverLoginState,
        options.currentPassword.finishLoginRequest,
      );
      if (!password.accepted) return password;
      if (requiresMfa && !recentMfa) throw new AppError('AUTH_REQUIRED');
      await this.renewAfterFreshProof(userId, sessionId);

      return { accepted: true };
    }

    if (requiresMfa) {
      // Email and password are deliberately not allowed to downgrade an MFA
      // protected account. Losing the factor uses Account Recovery instead.
      if (recentMfa) return { accepted: true };
      if (!options?.mfa) return { accepted: false };
      await this.verifyMfaProof(userId, options.mfa);
      await this.renewAfterFreshProof(userId, sessionId);

      return { accepted: true };
    }

    if (recent) return { accepted: true };

    if (options?.currentPassword) {
      const password = await this.verifyCurrentPassword(
        userId,
        options.currentPassword.serverLoginState,
        options.currentPassword.finishLoginRequest,
      );
      if (password.accepted) await this.renewAfterFreshProof(userId, sessionId);

      return password;
    }

    const emailCode = options?.emailCode;
    if (!emailCode) return { accepted: false };

    let proof: { jti: string };
    try {
      proof = await this.flowTokenService.verifySingleUseCode('possession_proof_email_code', userId, emailCode);
    } catch {
      throw new AppError('AUTH_REQUIRED');
    }

    const primary = await this.userEmailRepository.findPrimaryByUserId(userId);
    if (!primary) throw new AppError('AUTH_REQUIRED');

    const current = await this.userEmailRepository.findByEmail(primary.email);
    if (!current || current.userId !== userId || current.type !== 'primary' || !current.verifiedAt) {
      throw new AppError('AUTH_REQUIRED');
    }

    if (!(await this.flowTokenService.consumeSingleUse(proof, 'possession_proof_email_code'))) {
      throw new AppError('AUTH_REQUIRED');
    }
    await this.renewAfterFreshProof(userId, sessionId);

    return { accepted: true };
  }

  private async verifyMfaProof(
    userId: string,
    proof: { method: 'totp' | 'recovery_code'; code: string },
  ): Promise<void> {
    const totp = await this.mfaTotpRepository.findByUserId(userId);
    if (!totp || totp.status !== 'active') throw new AppError('AUTH_REQUIRED');
    if (proof.method === 'totp') {
      const secret = await this.totpSecretCryptoService.decryptBase32Secret(totp.encryptedSecret);
      if (!this.totpService.verifyToken({ token: proof.code, secret, window: 1 })) {
        throw new AppError('AUTH_INVALID_CREDENTIAL');
      }

      return;
    }
    const codeHash = await this.authSecretDigestService.hash(proof.code);
    if (!(await this.mfaRecoveryCodeRepository.findUnusedByUserIdAndHash(userId, codeHash))) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }
    if (!(await this.mfaRecoveryCodeRepository.consumeUnusedByUserIdAndHash(userId, codeHash))) {
      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }
  }

  private async renewAfterFreshProof(userId: string, sessionId: string): Promise<void> {
    const lastProofOfPossessionAt = new Date();
    if (
      !(await this.sessionRepository.renewAfterProof(
        userId,
        sessionId,
        lastProofOfPossessionAt,
        nextSessionExpiry(lastProofOfPossessionAt),
      ))
    ) {
      throw new AppError('AUTH_REQUIRED');
    }
  }

  private async verifyCurrentPassword(
    userId: string,
    serverLoginState: string,
    finishLoginRequest: string,
  ): Promise<PossessionProofVerifiedDTO> {
    const userRow = await this.accountService.getAuthenticationView(userId);
    if (!userRow) throw new AppError('USER_NOT_FOUND');
    if (userRow.deletedAt) throw new AppError('AUTH_INVALID_CREDENTIAL');
    assertUserCanAuthenticate({
      id: userRow.userId,
      status: userRow.status,
      mfaEnabled: userRow.mfaEnabled,
      lockedUntil: userRow.lockedUntil,
    });

    const credentialPassword = await this.credentialPasswordRepository.findByUserId(userId);
    if (!credentialPassword) throw new AppError('AUTH_INVALID_CREDENTIAL');
    if (credentialPassword.lockedUntil && credentialPassword.lockedUntil > new Date()) {
      throw new AppError('AUTH_TOO_MANY_ATTEMPTS');
    }

    try {
      await this.opaquePasswordService.finishLogin({ serverLoginState, finishLoginRequest });
    } catch {
      await this.handleFailedAttemptCommand.execute(userId);

      throw new AppError('AUTH_INVALID_CREDENTIAL');
    }

    await this.credentialPasswordRepository.resetFailedAttempts(credentialPassword.credentialId);

    return { accepted: true };
  }
}
