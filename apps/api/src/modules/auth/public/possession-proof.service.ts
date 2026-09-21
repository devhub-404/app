import { Injectable } from '@nestjs/common';
import type {
  PossessionProofAssurance,
  PossessionProofRequirement,
} from '@/modules/auth/public/possession-proof.service.port';
import { RequirePossessionProofCommand } from '@/modules/auth/application/auth/use-cases/command/require-possession-proof.command';
import { PossessionProofServicePort } from '@/modules/auth/public/possession-proof.service.port';

@Injectable()
export class PossessionProofService implements PossessionProofServicePort {
  constructor(private readonly requirePossessionProofCommand: RequirePossessionProofCommand) {}

  async requirePossessionProof(
    userId: string,
    sessionId: string,
    emailCode?: string | null,
    requiredAssurance: PossessionProofAssurance = 'current',
  ): Promise<PossessionProofRequirement> {
    return await this.requirePossessionProofCommand.execute(userId, sessionId, emailCode, requiredAssurance);
  }
}
