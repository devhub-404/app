import { Injectable } from '@nestjs/common';
import { VerifyPossessionProofCommand } from '@/modules/auth/application/auth/use-cases/command/verify-possession-proof.command';
import { PossessionProofRequirementResultDTO } from '@/modules/auth/application/auth/dtos/out';

@Injectable()
export class EvaluatePossessionProofRequirementQuery {
  constructor(private readonly verifyPossessionProofCommand: VerifyPossessionProofCommand) {}

  async execute(
    userId: string,
    sessionId: string,
    emailCode?: string | null,
    mfa?: { method: 'totp' | 'recovery_code'; code: string },
  ): Promise<PossessionProofRequirementResultDTO> {
    const result = await this.verifyPossessionProofCommand.execute(userId, sessionId, {
      ...(emailCode !== undefined ? { emailCode } : {}),
      ...(mfa ? { mfa } : {}),
      requiredAssurance: 'current',
    });

    return { accepted: result.accepted, required: !result.accepted };
  }
}
