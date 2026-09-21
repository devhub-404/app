import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { MfaTotpRepository } from '@/modules/auth/application/mfa/ports/mfa-totp.repository';
import { MfaRecoveryCodesDTO } from '@/modules/auth/application/mfa/dtos/out';
import { TotpService } from '@/modules/auth/domain/services/totp.service';
import { AuthSecretDigestService } from '@/modules/auth/domain/services/auth-secret-digest.service';
import { AccountAccessPort } from '@/modules/account/public/account-access.ports';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import { RequirePossessionProofCommand } from '@/modules/auth/application/auth/use-cases/command/require-possession-proof.command';

@Injectable()
export class RegenerateRecoveryCodesCommand {
  constructor(
    private readonly mfaTotpRepository: MfaTotpRepository,
    private readonly totpService: TotpService,
    private readonly authSecretDigestService: AuthSecretDigestService,
    private readonly userRepository: AccountAccessPort,
    private readonly requirePossessionProofCommand: RequirePossessionProofCommand,
  ) {}

  async execute(userId: string, sessionId: string): Promise<MfaRecoveryCodesDTO> {
    await this.requirePossessionProofCommand.execute(userId, sessionId, null, 'mfa');

    const userRow = await this.userRepository.findById(userId);
    if (!userRow) throw new AppError('USER_NOT_FOUND');
    assertUserCanAuthenticate(userRow);

    const totp = await this.mfaTotpRepository.findByUserId(userId);
    if (!totp || totp.status !== 'active') {
      throw new AppError('AUTH_MFA_NOT_ENABLED');
    }

    const recoveryCodes = this.totpService.generateBackupCodes({ count: 10 });
    const hashes = await Promise.all(recoveryCodes.map((item) => this.authSecretDigestService.hash(item)));

    await this.mfaTotpRepository.replaceRecoveryCodes(userId, hashes);

    return { recoveryCodes };
  }
}
