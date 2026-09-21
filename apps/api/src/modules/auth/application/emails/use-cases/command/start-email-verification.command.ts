import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { emitBestEffort } from '@/modules/auth/application/shared/emit-best-effort';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { JwtTokenType, EmailVerificationTokenDTO } from '@/modules/auth/application/shared/dto';
import {
  USER_EMAIL_VERIFICATION_REQUESTED_EVENT,
  UserEmailVerificationRequestedEvent,
} from '@/modules/auth/application/core/events/user-email-verification-requested.event';
import { AccountEmailAccessPort } from '@/modules/account/public/account-access.ports';
import { GenericAuthenticatedAckDTO } from '@/modules/auth/application/emails/dtos/out';

@Injectable()
export class StartEmailVerificationCommand {
  constructor(
    @Inject(FlowTokenService) private readonly flowTokenService: FlowTokenService,
    @Inject(AccountEmailAccessPort) private readonly userEmailRepository: AccountEmailAccessPort,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string): Promise<GenericAuthenticatedAckDTO> {
    const primary = await this.userEmailRepository.findPrimaryByUserId(userId);
    if (!primary) return { acknowledged: true };

    const current = await this.userEmailRepository.findByEmail(primary.email);
    if (!current || current.userId !== userId || current.verifiedAt !== null) return { acknowledged: true };

    const token = await this.flowTokenService.sign({
      type: JwtTokenType.EMAIL_VERIFICATION,
      payload: { sub: userId, email: primary.email } satisfies Partial<EmailVerificationTokenDTO>,
      expiresIn: '24h',
    });

    await emitBestEffort(
      this.eventEmitter,
      USER_EMAIL_VERIFICATION_REQUESTED_EVENT,
      new UserEmailVerificationRequestedEvent(userId, primary.email, token),
    );

    return { acknowledged: true };
  }
}
