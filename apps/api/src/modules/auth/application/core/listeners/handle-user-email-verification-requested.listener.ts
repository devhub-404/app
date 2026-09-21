import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailServicePort } from '@/modules/email/public';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import {
  USER_EMAIL_VERIFICATION_REQUESTED_EVENT,
  type UserEmailVerificationRequestedEvent,
} from '@/modules/auth/application/core/events/user-email-verification-requested.event';
import { emailVerificationTemplate } from '@/modules/email/public';

@Injectable()
export class HandleUserEmailVerificationRequestedListener {
  private readonly logger = new Logger(HandleUserEmailVerificationRequestedListener.name);

  constructor(
    private readonly emailService: EmailServicePort,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  @OnEvent(USER_EMAIL_VERIFICATION_REQUESTED_EVENT)
  async handle(event: UserEmailVerificationRequestedEvent): Promise<void> {
    const verifyUrl = `${this.config.siteUrl}/verify-email?token=${event.token}`;

    const message = emailVerificationTemplate({ url: verifyUrl });
    await this.emailService.send({
      from: 'DevHub',
      to: event.email,
      ...message,
    });

    this.logger.log(`Email verification sent: email=${event.email}`);
  }
}
