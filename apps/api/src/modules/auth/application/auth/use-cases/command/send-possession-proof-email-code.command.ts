import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { emitBestEffort } from '@/modules/auth/application/shared/emit-best-effort';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { AccountEmailAccessPort } from '@/modules/account/public/account-access.ports';
import {
  USER_POSSESSION_PROOF_EMAIL_CODE_REQUESTED_EVENT,
  UserPossessionProofEmailCodeRequestedEvent,
} from '@/modules/auth/application/core/events/user-possession-proof-email-code-requested.event';
import { ACCOUNT_SERVICE, AccountServicePort } from '@/modules/account/public/account.service.port';
import { SendPossessionProofEmailCodeInputDTO } from '@/modules/auth/application/auth/dtos/in';
import { PossessionProofStartedDTO } from '@/modules/auth/application/auth/dtos/out';

@Injectable()
export class SendPossessionProofEmailCodeCommand {
  constructor(
    @Inject(ACCOUNT_SERVICE)
    private readonly accountService: AccountServicePort,
    private readonly userEmailRepository: AccountEmailAccessPort,
    private readonly flowTokenService: FlowTokenService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: SendPossessionProofEmailCodeInputDTO): Promise<PossessionProofStartedDTO> {
    const user = await this.accountService.getAuthenticationView(input.userId);
    if (!user || user.status !== 'active' || user.lockedUntil || user.deletedAt || !user.primaryEmailVerified) {
      return { sent: false };
    }

    if (user.mfaEnabled) {
      return { sent: false, mfaRequired: true };
    }

    const primary = await this.userEmailRepository.findPrimaryByUserId(input.userId);
    if (!primary) {
      return { sent: false };
    }

    const current = await this.userEmailRepository.findByEmail(primary.email);
    if (!current || current.userId !== input.userId || current.type !== 'primary' || !current.verifiedAt) {
      return { sent: false };
    }

    const code = await this.flowTokenService.signSingleUseCode({
      purpose: 'possession_proof_email_code',
      subjectId: input.userId,
      expiresIn: '10m',
    });

    await emitBestEffort(
      this.eventEmitter,
      USER_POSSESSION_PROOF_EMAIL_CODE_REQUESTED_EVENT,
      new UserPossessionProofEmailCodeRequestedEvent(input.userId, primary.email, code),
    );

    return { sent: true };
  }
}
