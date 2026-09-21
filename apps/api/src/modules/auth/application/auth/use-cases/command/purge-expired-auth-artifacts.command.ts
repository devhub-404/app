import { Injectable, Logger } from '@nestjs/common';
import { SessionRepository } from '@/modules/auth/application/sessions/ports/session.repository';
import { AuthFlowProofRepository } from '@/modules/auth/application/shared/ports/auth-flow-proof.repository';

const AUTH_ARTIFACT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class PurgeExpiredAuthArtifactsCommand {
  private readonly logger = new Logger(PurgeExpiredAuthArtifactsCommand.name);

  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly authFlowProofRepository: AuthFlowProofRepository,
  ) {}

  async execute(): Promise<number> {
    const cutoff = new Date(Date.now() - AUTH_ARTIFACT_RETENTION_MS);
    const [sessions, flowProofs] = await Promise.all([
      this.sessionRepository.deleteExpiredBefore(cutoff),
      this.authFlowProofRepository.deleteExpiredBefore(new Date()),
    ]);
    const deleted = sessions + flowProofs;
    if (deleted > 0) this.logger.log(`Purged ${sessions} auth sessions and ${flowProofs} flow proofs`);

    return deleted;
  }
}
