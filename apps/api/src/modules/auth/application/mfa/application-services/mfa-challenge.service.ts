import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { JwtTokenType, MfaChallengeTokenDTO } from '@/modules/auth/application/shared/dto';
import { MfaRecoveryCodeRepository } from '@/modules/auth/application/mfa/ports/mfa-recovery-code.repository';
import { MfaTotpRepository } from '@/modules/auth/application/mfa/ports/mfa-totp.repository';
import { MfaChallengeInputDTO, MfaChallengeResultDTO } from '@/modules/auth/application/mfa/dtos';

@Injectable()
export class MfaChallengeService {
  constructor(
    private readonly flowTokenService: FlowTokenService,
    private readonly mfaTotpRepository: MfaTotpRepository,
    private readonly mfaRecoveryCodeRepository: MfaRecoveryCodeRepository,
  ) {}

  async execute(input: MfaChallengeInputDTO): Promise<MfaChallengeResultDTO> {
    const [totp, recoveryCodes] = await Promise.all([
      this.mfaTotpRepository.findByUserId(input.userId),
      this.mfaRecoveryCodeRepository.listByUserId(input.userId),
    ]);

    const methods: string[] = [];
    if (totp?.status === 'active') methods.push('totp');
    if (recoveryCodes.some((item) => item.usedAt === null)) methods.push('recovery_code');

    // mfaEnabled without an active factor is an inconsistent state. Do not
    // create a challenge that can never be satisfied; Account recovery is the
    // explicit escape hatch for loss of the current factor.
    if (methods.length === 0) throw new AppError('AUTH_REQUIRED');

    const token = await this.flowTokenService.signSingleUse({
      type: JwtTokenType.MFA_CHALLENGE,
      purpose: 'mfa_challenge',
      payload: {
        sub: input.userId,
        ...(input.credentialId ? { credentialId: input.credentialId } : {}),
        method: input.authMethod,
      } satisfies Omit<MfaChallengeTokenDTO, 'type'>,
      expiresIn: '5m',
    });

    return { mfaRequired: true, token, methods };
  }
}
