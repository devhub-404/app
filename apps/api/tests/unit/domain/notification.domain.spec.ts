import { describe, expect, it } from 'vitest';
import { Notification } from '@/modules/notification/domain/notification';

describe('Notification domain', () => {
  it('NTF-RN-003 — requires complete source and target references', () => {
    expect(() =>
      Notification.create('notification-1', {
        accountId: 'account-1',
        type: 'article_commented',
        sourceType: 'comment',
      }),
    ).toThrow('NOTIFICATION_SOURCE_REFERENCE_INCOMPLETE');
  });

  it('NTF-RN-006 — keeps delivery and reading as independent idempotent facts', () => {
    const notification = Notification.create('notification-1', {
      accountId: 'account-1',
      type: 'article_commented',
      sourceType: 'comment',
      sourceId: 'comment-1',
      targetType: 'article',
      targetId: 'article-1',
    });

    notification.markSeen(new Date('2026-01-01T00:00:00.000Z'));
    notification.markSeen(new Date('2026-01-02T00:00:00.000Z'));
    notification.markRead(new Date('2026-01-03T00:00:00.000Z'));

    expect(notification.value).toMatchObject({
      seenAt: '2026-01-01T00:00:00.000Z',
      readAt: '2026-01-03T00:00:00.000Z',
    });
  });
});
