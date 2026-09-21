import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { AccountAccessPort } from '@/modules/account/public/account-access.ports';
import { MfaTotpRepository } from '@/modules/auth/application/mfa/ports/mfa-totp.repository';
import { TotpService } from '@/modules/auth/domain/services/totp.service';
import { TotpSecretCryptoService } from '@/modules/auth/domain/services/totp-secret-crypto.service';
import { MfaTotpEnrollStartDTO } from '@/modules/auth/application/mfa/dtos/out';
import { assertUserCanAuthenticate } from '@/modules/auth/application/shared/assert-user-can-authenticate';
import { RequirePossessionProofCommand } from '@/modules/auth/application/auth/use-cases/command/require-possession-proof.command';
import { MfaTotp } from '@/modules/auth/domain/entities/mfa-totp';

@Injectable()
export class StartTotpEnrollmentCommand {
  constructor(
    private readonly totpService: TotpService,
    private readonly totpSecretCryptoService: TotpSecretCryptoService,
    private readonly mfaTotpRepository: MfaTotpRepository,
    private readonly userRepository: AccountAccessPort,
    private readonly requirePossessionProofCommand: RequirePossessionProofCommand,
  ) {}

  async execute(userId: string, sessionId: string): Promise<MfaTotpEnrollStartDTO> {
    await this.requirePossessionProofCommand.execute(userId, sessionId, null, 'standard');

    const userRow = await this.userRepository.findById(userId);
    if (!userRow) {
      throw new AppError('USER_NOT_FOUND');
    }

    assertUserCanAuthenticate(userRow);

    if (userRow.mfaEnabled) {
      throw new AppError('AUTH_MFA_ALREADY_ENABLED');
    }

    const secret = this.totpService.generateBase32Secret();
    const encryptedSecret = await this.totpSecretCryptoService.encryptBase32Secret(secret);
    const enrollment = MfaTotp.createPending(userId, encryptedSecret);

    await this.mfaTotpRepository.upsert({
      userId: enrollment.userId,
      encryptedSecret: enrollment.encryptedSecret,
      status: enrollment.status,
    });

    return {
      secret,
      otpauthUri: this.totpService.generateOtpAuthUri({
        issuer: 'DevHub',
        accountName: userId,
        secret,
      }),
      status: 'pending',
    };
  }
}
