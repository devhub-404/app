import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { PossessionProofRequirementResultDTO } from '@/modules/auth/application/auth/dtos/out';
import { SendPossessionProofEmailCodeCommand } from '@/modules/auth/application/auth/use-cases/command/send-possession-proof-email-code.command';
import {
  VerifyPossessionProofCommand,
  type PossessionProofAssurance,
} from '@/modules/auth/application/auth/use-cases/command/verify-possession-proof.command';

@Injectable()
export class RequirePossessionProofCommand {
  constructor(
    private readonly verifyPossessionProofCommand: VerifyPossessionProofCommand,
    private readonly sendPossessionProofEmailCodeCommand: SendPossessionProofEmailCodeCommand,
  ) {}

  async execute(
    userId: string,
    sessionId: string,
    emailCode?: string | null,
    requiredAssurance: PossessionProofAssurance = 'current',
  ): Promise<PossessionProofRequirementResultDTO> {
    const allowed = await this.verifyPossessionProofCommand.execute(userId, sessionId, {
      ...(emailCode !== undefined ? { emailCode } : {}),
      requiredAssurance,
    });
    if (!allowed.accepted) {
      if (!emailCode && requiredAssurance === 'standard') {
        await this.sendPossessionProofEmailCodeCommand.execute({ userId });
      }

      throw new AppError('AUTH_REQUIRED');
    }

    return { accepted: true, required: false };
  }
}
