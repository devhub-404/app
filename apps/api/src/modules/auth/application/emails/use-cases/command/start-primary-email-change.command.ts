import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { emitBestEffort } from '@/modules/auth/application/shared/emit-best-effort';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { JwtTokenType, EmailChangePrimaryTokenDTO } from '@/modules/auth/application/shared/dto';
import { GenericAuthenticatedAckDTO } from '@/modules/auth/application/emails/dtos/out';
import {
  USER_EMAIL_VERIFICATION_REQUESTED_EVENT,
  UserEmailVerificationRequestedEvent,
} from '@/modules/auth/application/core/events/user-email-verification-requested.event';
import { AccountEmailAccessPort } from '@/modules/account/public/account-access.ports';
import { AppError } from '@/shared/errors/app-error';
import { assertEmailAddressCanBeUsedForIdentity } from '@/modules/auth/application/shared/email-address-policy';
import {
  POSSESSION_PROOF_SERVICE,
  PossessionProofServicePort,
} from '@/modules/auth/public/possession-proof.service.port';

@Injectable()
export class StartPrimaryEmailChangeCommand {
  constructor(
    @Inject(FlowTokenService) private readonly flowTokenService: FlowTokenService,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
    @Inject(AccountEmailAccessPort) private readonly userEmailRepository: AccountEmailAccessPort,
    @Inject(POSSESSION_PROOF_SERVICE) private readonly possessionProofService: PossessionProofServicePort,
  ) {}

  async execute(userId: string, sessionId: string, email: string): Promise<GenericAuthenticatedAckDTO> {
    await this.possessionProofService.requirePossessionProof(userId, sessionId);
    assertEmailAddressCanBeUsedForIdentity(email);
    const current = await this.userEmailRepository.findByEmail(email);
    if (current && current.userId !== userId) {
      throw new AppError('INVALID_EMAIL');
    }

    const token = await this.flowTokenService.signSingleUse({
      type: JwtTokenType.EMAIL_CHANGE_PRIMARY,
      purpose: 'email_change_primary',
      payload: { sub: userId, email } satisfies Partial<EmailChangePrimaryTokenDTO>,
      expiresIn: '15m',
    });

    await emitBestEffort(
      this.eventEmitter,
      USER_EMAIL_VERIFICATION_REQUESTED_EVENT,
      new UserEmailVerificationRequestedEvent(userId, email, token),
    );

    return { acknowledged: true };
  }
}
