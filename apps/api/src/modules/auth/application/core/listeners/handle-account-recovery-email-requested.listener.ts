import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { EmailServicePort } from '@/modules/email/public';
import { accountRecoveryTemplate } from '@/modules/email/public';
import {
  ACCOUNT_RECOVERY_EMAIL_REQUESTED_EVENT,
  type AccountRecoveryEmailRequestedEvent,
} from '@/modules/auth/application/core/events/account-recovery-email-requested.event';

@Injectable()
export class HandleAccountRecoveryEmailRequestedListener {
  private readonly logger = new Logger(HandleAccountRecoveryEmailRequestedListener.name);

  constructor(
    private readonly emailService: EmailServicePort,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  @OnEvent(ACCOUNT_RECOVERY_EMAIL_REQUESTED_EVENT)
  async handle(event: AccountRecoveryEmailRequestedEvent): Promise<void> {
    const message = accountRecoveryTemplate({
      url: `${this.config.siteUrl}/auth/account-recovery?token=${encodeURIComponent(event.token)}`,
    });
    await this.emailService.send({ from: 'DevHub', to: event.email, ...message });
    this.logger.log(`Account recovery email sent: userId=${event.userId}`);
  }
}
