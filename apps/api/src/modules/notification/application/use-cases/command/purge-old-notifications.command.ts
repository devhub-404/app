import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '@/modules/notification/application/ports/repositories';

const NOTIFICATION_RETENTION_DAYS = 30;
const NOTIFICATION_RETENTION_MS = NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000;

@Injectable()
export class PurgeOldNotificationsCommand {
  private readonly logger = new Logger(PurgeOldNotificationsCommand.name);

  constructor(private readonly repository: NotificationRepository) {}

  async execute(now = new Date()): Promise<number> {
    const cutoff = new Date(now.getTime() - NOTIFICATION_RETENTION_MS).toISOString();
    const deleted = await this.repository.deleteCreatedBefore(cutoff);
    if (deleted > 0) this.logger.log(`Purged ${deleted} notifications older than ${NOTIFICATION_RETENTION_DAYS} days`);

    return deleted;
  }
}
