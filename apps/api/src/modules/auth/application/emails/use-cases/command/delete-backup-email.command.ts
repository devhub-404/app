import { Inject, Injectable } from '@nestjs/common';
import { AccountEmailAccessPort } from '@/modules/account/public/account-access.ports';
import {
  POSSESSION_PROOF_SERVICE,
  PossessionProofServicePort,
} from '@/modules/auth/public/possession-proof.service.port';

@Injectable()
export class DeleteBackupEmailCommand {
  constructor(
    @Inject(AccountEmailAccessPort) private readonly userEmailRepository: AccountEmailAccessPort,
    @Inject(POSSESSION_PROOF_SERVICE) private readonly possessionProofService: PossessionProofServicePort,
  ) {}

  async execute(userId: string, sessionId: string): Promise<void> {
    await this.possessionProofService.requirePossessionProof(userId, sessionId);
    await this.userEmailRepository.deleteBackupByUserId(userId);
  }
}
