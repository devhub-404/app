import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailServicePort } from '@/modules/email/public';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import {
  USER_PASSWORD_RESET_REQUESTED_EVENT,
  type UserPasswordResetRequestedEvent,
} from '@/modules/auth/application/core/events/user-password-reset-requested.event';
import { passwordResetTemplate } from '@/modules/email/public';

@Injectable()
export class HandleUserPasswordResetRequestedListener {
  private readonly logger = new Logger(HandleUserPasswordResetRequestedListener.name);

  constructor(
    private readonly emailService: EmailServicePort,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  @OnEvent(USER_PASSWORD_RESET_REQUESTED_EVENT)
  async handle(event: UserPasswordResetRequestedEvent): Promise<void> {
    const resetUrl = `${this.config.siteUrl}/reset-password?token=${event.token}`;

    const message = passwordResetTemplate({ url: resetUrl });
    await this.emailService.send({
      from: 'DevHub',
      to: event.email,
      ...message,
    });

    this.logger.log(`Password reset email sent: email=${event.email}`);
  }
}
