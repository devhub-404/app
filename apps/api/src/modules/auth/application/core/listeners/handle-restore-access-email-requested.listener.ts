import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { EmailServicePort } from '@/modules/email/public';
import { restoreAccessTemplate } from '@/modules/email/public';
import {
  RESTORE_ACCESS_EMAIL_REQUESTED_EVENT,
  type RestoreAccessEmailRequestedEvent,
} from '@/modules/auth/application/core/events/restore-access-email-requested.event';

@Injectable()
export class HandleRestoreAccessEmailRequestedListener {
  private readonly logger = new Logger(HandleRestoreAccessEmailRequestedListener.name);

  constructor(
    private readonly emailService: EmailServicePort,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  @OnEvent(RESTORE_ACCESS_EMAIL_REQUESTED_EVENT)
  async handle(event: RestoreAccessEmailRequestedEvent): Promise<void> {
    const message = restoreAccessTemplate({
      url: `${this.config.siteUrl}/restore-account?token=${encodeURIComponent(event.token)}`,
    });
    await this.emailService.send({ from: 'DevHub', to: event.email, ...message });
    this.logger.log(`Restore access email sent: userId=${event.userId}`);
  }
}
