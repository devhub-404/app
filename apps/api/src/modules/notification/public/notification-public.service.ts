import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../application/ports/repositories';
import type { NotificationReferenceType, NotificationType } from '../domain/notification';

export type CreateNotificationInput = {
  accountId: string;
  type: NotificationType;
  targetType?: NotificationReferenceType | null;
  targetId?: string | null;
  sourceType: NotificationReferenceType;
  sourceId: string;
};

@Injectable()
export class NotificationPublicService {
  private readonly logger = new Logger(NotificationPublicService.name);

  constructor(private readonly repository: NotificationRepository) {}

  async notify(input: CreateNotificationInput) {
    try {
      return await this.repository.create(input);
    } catch (error) {
      this.logger.error(`Unable to persist notification ${input.type} for account ${input.accountId}`, error);

      return null;
    }
  }
}
