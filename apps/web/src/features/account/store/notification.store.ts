import { atom } from 'nanostores';
import type { NotificationItem } from '@/features/account/types/notification.type.ts';

export type NotificationsState = {
  items: NotificationItem[];
  unread: number;
  loading: boolean;
  cursor?: string;
};

export const initialNotificationsState: NotificationsState = { items: [], unread: 0, loading: false };
export const $notifications = atom<NotificationsState>(initialNotificationsState);
