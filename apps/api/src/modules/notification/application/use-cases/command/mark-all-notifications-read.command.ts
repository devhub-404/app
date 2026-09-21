import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../../ports/repositories';
import type { MarkAllNotificationsReadResultDTO } from '../../dtos/out';

@Injectable()
export class MarkAllNotificationsReadCommand {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(accountId: string): Promise<MarkAllNotificationsReadResultDTO> {
    return { updated: await this.repository.markAllRead(accountId) };
  }
}
