import { Inject, Injectable } from '@nestjs/common';
import { canonicalizeEmailAddress } from '@/modules/account/public';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { emitBestEffort } from '@/modules/auth/application/shared/emit-best-effort';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { JwtTokenType, EmailVerificationTokenDTO, GenericPublicAckDTO } from '@/modules/auth/application/shared/dto';
import { AccountEmailAccessPort } from '@/modules/account/public/account-access.ports';
import {
  USER_EMAIL_VERIFICATION_REQUESTED_EVENT,
  UserEmailVerificationRequestedEvent,
} from '@/modules/auth/application/core/events/user-email-verification-requested.event';

@Injectable()
export class ResendEmailVerificationCommand {
  constructor(
    @Inject(AccountEmailAccessPort) private readonly userEmailRepository: AccountEmailAccessPort,
    @Inject(FlowTokenService) private readonly flowTokenService: FlowTokenService,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(email: string): Promise<GenericPublicAckDTO> {
    const current = await this.userEmailRepository.findByEmail(canonicalizeEmailAddress(email));
    if (!current || current.type !== 'primary' || current.verifiedAt) return { acknowledged: true };

    const token = await this.flowTokenService.sign({
      type: JwtTokenType.EMAIL_VERIFICATION,
      payload: { sub: current.userId, email: current.email } satisfies Partial<EmailVerificationTokenDTO>,
      expiresIn: '24h',
    });

    await emitBestEffort(
      this.eventEmitter,
      USER_EMAIL_VERIFICATION_REQUESTED_EVENT,
      new UserEmailVerificationRequestedEvent(current.userId, current.email, token),
    );

    return { acknowledged: true };
  }
}
