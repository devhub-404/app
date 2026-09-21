import { BadRequestException, Injectable } from '@nestjs/common';
import { NotificationRepository } from '../../ports/repositories';
import type { SyncNotificationsDTO } from '../../dtos/out';
import { decodeNotificationCursor, encodeNotificationCursor } from '../../shared/notification-cursor';

@Injectable()
export class ListMyNotificationsQuery {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(accountId: string, encodedCursor?: string): Promise<SyncNotificationsDTO> {
    const decodedCursor = encodedCursor ? decodeNotificationCursor(encodedCursor) : null;
    if (encodedCursor && !decodedCursor) throw new BadRequestException('Invalid notification cursor');
    const cursor = decodedCursor ?? undefined;

    const items = await this.repository.list(accountId, cursor);
    const seenAt = new Date().toISOString();
    const unseenIds = items.filter((item) => item.seenAt === null).map((item) => item.id);
    if (unseenIds.length > 0) await this.repository.markSeen(accountId, unseenIds, seenAt);
    const projectedItems = items.map((item) => (item.seenAt === null ? { ...item, seenAt } : item));
    const unreadCount = await this.repository.unreadCount(accountId);

    let nextCursor = encodedCursor ?? null;
    if (projectedItems.length > 0) {
      const oldest = projectedItems[projectedItems.length - 1];
      nextCursor = encodeNotificationCursor(oldest);
    }

    return { items: projectedItems, nextCursor, unreadCount };
  }
}
