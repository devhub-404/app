import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../../ports/repositories';
import type { NotificationStatusDTO } from '../../dtos/out';

@Injectable()
export class GetNotificationStatusQuery {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(accountId: string): Promise<NotificationStatusDTO> {
    return { unreadCount: await this.repository.unreadCount(accountId) };
  }
}
