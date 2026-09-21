import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { EmailServicePort } from '@/modules/email/public';
import {
  USER_MAGIC_LINK_LOGIN_REQUESTED_EVENT,
  type MagicLinkLoginRequestedEvent,
} from '@/modules/auth/application/core/events/magic-link-login-requested.event';
import { magicLinkTemplate } from '@/modules/email/public';

@Injectable()
export class HandleMagicLinkLoginRequestedListener {
  private readonly logger = new Logger(HandleMagicLinkLoginRequestedListener.name);

  constructor(
    private readonly emailService: EmailServicePort,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  @OnEvent(USER_MAGIC_LINK_LOGIN_REQUESTED_EVENT)
  async handle(event: MagicLinkLoginRequestedEvent): Promise<void> {
    const loginUrl = `${this.config.siteUrl}/auth/magic-link?token=${encodeURIComponent(event.token)}`;

    const message = magicLinkTemplate({ url: loginUrl });
    await this.emailService.send({
      from: 'DevHub',
      to: event.email,
      ...message,
    });

    this.logger.log(`Magic link email sent: email=${event.email}`);
  }
}
