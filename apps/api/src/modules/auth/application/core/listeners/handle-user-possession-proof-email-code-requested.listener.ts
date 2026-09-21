import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailServicePort } from '@/modules/email/public';
import {
  USER_POSSESSION_PROOF_EMAIL_CODE_REQUESTED_EVENT,
  type UserPossessionProofEmailCodeRequestedEvent,
} from '@/modules/auth/application/core/events/user-possession-proof-email-code-requested.event';
import { possessionProofCodeTemplate } from '@/modules/email/public';

@Injectable()
export class HandleUserPossessionProofEmailCodeRequestedListener {
  private readonly logger = new Logger(HandleUserPossessionProofEmailCodeRequestedListener.name);

  constructor(private readonly emailService: EmailServicePort) {}

  @OnEvent(USER_POSSESSION_PROOF_EMAIL_CODE_REQUESTED_EVENT)
  async handle(event: UserPossessionProofEmailCodeRequestedEvent): Promise<void> {
    const message = possessionProofCodeTemplate({ code: event.code });
    await this.emailService.send({
      from: 'DevHub',
      to: event.email,
      ...message,
    });

    this.logger.log(`Possession proof code sent: userId=${event.userId}`);
  }
}
