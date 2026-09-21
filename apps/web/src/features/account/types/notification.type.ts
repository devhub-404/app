import type { components } from '@devhub-404/api-contract';

export type NotificationItem = components['schemas']['NotificationDTO'];
export type NotificationSync = components['schemas']['SyncNotificationsDTO'];
export type MarkAllReadResult = components['schemas']['MarkAllNotificationsReadResultDTO'];
export type NotificationType = NotificationItem['type'];
export type NotificationStatus = { unreadCount: number };
