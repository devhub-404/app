import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ACCOUNT_DEACTIVATED_EVENT, type AccountDeactivatedEvent } from '@/modules/account/public/events';
import { AccountEmailAccessPort } from '@/modules/account/public';
import { EmailServicePort, accountDeactivatedTemplate } from '@/modules/email/public';

@Injectable()
export class HandleAccountDeactivatedEmailRequestedListener {
  private readonly logger = new Logger(HandleAccountDeactivatedEmailRequestedListener.name);

  constructor(
    private readonly emailService: EmailServicePort,
    private readonly accountEmailAccess: AccountEmailAccessPort,
  ) {}

  @OnEvent(ACCOUNT_DEACTIVATED_EVENT)
  async handle(event: AccountDeactivatedEvent): Promise<void> {
    try {
      const primaryEmail = await this.accountEmailAccess.findPrimaryByUserId(event.userId);
      if (!primaryEmail) return;

      const email = await this.accountEmailAccess.findByEmail(primaryEmail.email);
      if (!email || email.userId !== event.userId || !email.verifiedAt) return;

      const message = accountDeactivatedTemplate({});
      await this.emailService.send({ from: 'DevHub', to: email.email, ...message });
      this.logger.log(`Account deactivation email sent: userId=${event.userId}`);
    } catch (error) {
      this.logger.warn(`Account deactivation email failed: userId=${event.userId}`);
      this.logger.debug(error instanceof Error ? error.message : String(error));
    }
  }
}
