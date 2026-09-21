import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { NotificationRepository } from '../../ports/repositories';
import type { NotificationRecord } from '../../../domain/notification';

@Injectable()
export class MarkNotificationReadCommand {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(accountId: string, id: string): Promise<NotificationRecord> {
    const notification = await this.repository.markRead(accountId, id);
    if (!notification) throw new AppError('CONTENT_NOT_FOUND');

    return notification;
  }
}
