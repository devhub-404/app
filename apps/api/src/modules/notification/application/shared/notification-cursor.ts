import type { NotificationCursor, NotificationRecord } from '../../domain/notification';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function encodeNotificationCursor(record: Pick<NotificationRecord, 'createdAt' | 'id'>): string {
  return Buffer.from(`${record.createdAt}\n${record.id}`, 'utf8').toString('base64url');
}

export function decodeNotificationCursor(value: string): NotificationCursor | null {
  try {
    const decoded = Buffer.from(value, 'base64url').toString('utf8');
    const separator = decoded.indexOf('\n');
    if (separator <= 0) return null;
    const createdAt = decoded.slice(0, separator);
    const id = decoded.slice(separator + 1);
    if (!UUID_PATTERN.test(id) || Number.isNaN(Date.parse(createdAt))) return null;

    return { createdAt: new Date(createdAt).toISOString(), id };
  } catch {
    return null;
  }
}
