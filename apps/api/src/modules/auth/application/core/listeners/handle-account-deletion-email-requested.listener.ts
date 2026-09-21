import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ACCOUNT_DELETION_REQUESTED_EVENT, type AccountDeletionRequestedEvent } from '@/modules/account/public/events';
import { AccountEmailAccessPort } from '@/modules/account/public';
import { RestoreAccessEmailService } from '@/modules/auth/application/auth/application-services/restore-access-email.service';

@Injectable()
export class HandleAccountDeletionEmailRequestedListener {
  private readonly logger = new Logger(HandleAccountDeletionEmailRequestedListener.name);

  constructor(
    private readonly accountEmailAccess: AccountEmailAccessPort,
    private readonly restoreAccessEmailService: RestoreAccessEmailService,
  ) {}

  @OnEvent(ACCOUNT_DELETION_REQUESTED_EVENT)
  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    try {
      const primaryEmail = await this.accountEmailAccess.findPrimaryByUserId(event.userId);
      if (!primaryEmail) return;

      const email = await this.accountEmailAccess.findByEmail(primaryEmail.email);
      if (!email || email.userId !== event.userId || !email.verifiedAt) return;

      await this.restoreAccessEmailService.execute({ userId: event.userId, email: email.email });
      this.logger.log(`Account deletion email requested: userId=${event.userId}`);
    } catch (error) {
      this.logger.warn(`Account deletion email failed: userId=${event.userId}`);
      this.logger.debug(error instanceof Error ? error.message : String(error));
    }
  }
}
