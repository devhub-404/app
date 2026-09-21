import type {
  NotificationCursor,
  NotificationRecord,
  NotificationReferenceType,
  NotificationType,
} from '../../../domain/notification';

export type CreateNotificationRecord = {
  accountId: string;
  type: NotificationType;
  targetType?: NotificationReferenceType | null;
  targetId?: string | null;
  sourceType?: NotificationReferenceType | null;
  sourceId?: string | null;
};

export abstract class NotificationRepository {
  abstract create(input: CreateNotificationRecord): Promise<NotificationRecord | null>;
  abstract list(accountId: string, cursor?: NotificationCursor): Promise<NotificationRecord[]>;
  abstract unreadCount(accountId: string): Promise<number>;
  abstract markSeen(accountId: string, ids: string[], seenAt: string): Promise<number>;
  abstract markRead(accountId: string, id: string): Promise<NotificationRecord | null>;
  abstract markAllRead(accountId: string): Promise<number>;
  abstract deleteCreatedBefore(cutoff: string): Promise<number>;
  abstract deleteByAccountId(accountId: string): Promise<number>;
}
