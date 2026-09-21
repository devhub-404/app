import { privateClient } from '@/shared/api';
import type { ApiResult } from '@/shared/api';
import type {
  MarkAllReadResult,
  NotificationItem,
  NotificationSync,
} from '@/features/account/types/notification.type.ts';

export class NotificationsApi {
  static sync(cursor?: string, options?: { signal?: AbortSignal }): Promise<ApiResult<NotificationSync>> {
    return privateClient.GET('/api/v1/me/notifications', {
      params: { query: cursor ? { cursor } : {} },
      signal: options?.signal,
    });
  }
  static markRead(id: string, options?: { signal?: AbortSignal }): Promise<ApiResult<NotificationItem>> {
    return privateClient.PATCH('/api/v1/me/notifications/{id}/read', {
      params: { path: { id } },
      signal: options?.signal,
    });
  }
  static markAllRead(options?: { signal?: AbortSignal }): Promise<ApiResult<MarkAllReadResult>> {
    return privateClient.POST('/api/v1/me/notifications/read-all', { signal: options?.signal });
  }
}
