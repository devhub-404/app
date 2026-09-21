import { Injectable } from '@nestjs/common';
import { MfaRecoveryCodeRepository } from '@/modules/auth/application/mfa/ports/mfa-recovery-code.repository';
import { MfaTotpRepository } from '@/modules/auth/application/mfa/ports/mfa-totp.repository';
import { MfaConfigurationDTO } from '@/modules/auth/application/mfa/dtos/out/mfa-configuration.dto';

@Injectable()
export class GetMyMfaConfigurationQuery {
  constructor(
    private readonly mfaTotpRepository: MfaTotpRepository,
    private readonly mfaRecoveryCodeRepository: MfaRecoveryCodeRepository,
  ) {}

  async execute(userId: string): Promise<MfaConfigurationDTO> {
    const [totp, recoveryCodes] = await Promise.all([
      this.mfaTotpRepository.findByUserId(userId),
      this.mfaRecoveryCodeRepository.listByUserId(userId),
    ]);
    const totpStatus = totp?.status ?? null;

    return {
      enabled: totpStatus === 'active',
      totpEnrolled: totp !== null && totpStatus !== 'disabled',
      totpStatus,
      recoveryCodesRemaining: recoveryCodes.filter((code) => code.usedAt === null).length,
    };
  }
}
