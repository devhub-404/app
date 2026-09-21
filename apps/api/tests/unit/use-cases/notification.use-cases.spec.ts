import { describe, expect, it, vi } from 'vitest';
import { ListMyNotificationsQuery } from '@/modules/notification/application/use-cases/query/list-my-notifications.query';
import { SyncNotificationsQuery } from '@/modules/notification/application/use-cases/query/sync-notifications.query';
import { MarkNotificationReadCommand } from '@/modules/notification/application/use-cases/command/mark-notification-read.command';
import { MarkAllNotificationsReadCommand } from '@/modules/notification/application/use-cases/command/mark-all-notifications-read.command';
import { PurgeOldNotificationsCommand } from '@/modules/notification/application/use-cases/command/purge-old-notifications.command';
import { CreateNotificationCommand } from '@/modules/notification/application/use-cases/command/create-notification.command';
import { NotificationPublicService } from '@/modules/notification/public/notification-public.service';
import type { NotificationRecord } from '@/modules/notification/domain/notification';
import {
  decodeNotificationCursor,
  encodeNotificationCursor,
} from '@/modules/notification/application/shared/notification-cursor';

// NTF-RN-001..007, NTF-RF-001..003, NTF-RNF-001 and ARCH-RNF-012.
// Normative source: docs/domains/notification/SPEC.md

describe('Notification normative application contract', () => {
  const unread: NotificationRecord = {
    id: 'notification-1',
    accountId: 'account-1',
    type: 'question_answered',
    targetType: 'question',
    targetId: 'question-1',
    sourceType: 'answer',
    sourceId: 'answer-1',
    seenAt: null,
    readAt: null,
    createdAt: '2026-08-15T12:00:00.000Z',
  };

  it('lists only through the recipient account boundary and returns an incremental cursor', async () => {
    const repository = {
      list: vi.fn(async (accountId: string) => (accountId === 'account-1' ? [unread] : [])),
      markSeen: vi.fn(async (_accountId: string, ids: string[]) => ids.length),
      unreadCount: vi.fn(async (accountId: string) => (accountId === 'account-1' ? 1 : 0)),
    };

    const result = await new ListMyNotificationsQuery(repository as never).execute('account-1');

    expect(repository.list).toHaveBeenCalledWith('account-1', undefined);
    expect(repository.markSeen).toHaveBeenCalledWith('account-1', ['notification-1'], expect.any(String));
    expect(repository.unreadCount).toHaveBeenCalledWith('account-1');
    expect(result.items).toEqual([{ ...unread, seenAt: expect.any(String) }]);
    expect(result.unreadCount).toBe(1);
    expect(result.nextCursor).toEqual(expect.any(String));
  });

  it('sync is the same incremental recipient-scoped contract, not an independent polling state machine', async () => {
    const list = { execute: vi.fn(async () => ({ items: [unread], nextCursor: 'cursor-1', unreadCount: 1 })) };
    const query = new SyncNotificationsQuery(list as never);

    await expect(query.execute('account-1', 'cursor-0')).resolves.toEqual({
      items: [unread],
      nextCursor: 'cursor-1',
      unreadCount: 1,
    });
    expect(list.execute).toHaveBeenCalledWith('account-1', 'cursor-0');
  });

  it('NTF-RF-002 — encodes and decodes a cursor from the notification ordering key', () => {
    const cursor = encodeNotificationCursor({
      createdAt: '2026-08-15T12:00:00.000Z',
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(decodeNotificationCursor(cursor)).toEqual({
      createdAt: '2026-08-15T12:00:00.000Z',
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(decodeNotificationCursor('not-a-cursor')).toBeNull();
  });

  it('marks one notification read only in the recipient account scope', async () => {
    const marked = { ...unread, readAt: '2026-08-15T12:01:00.000Z' };
    const repository = { markRead: vi.fn(async () => marked) };

    await expect(new MarkNotificationReadCommand(repository as never).execute('account-1', unread.id)).resolves.toEqual(
      marked,
    );
    expect(repository.markRead).toHaveBeenCalledWith('account-1', unread.id);
  });

  it('marks all unread notifications for the recipient as read', async () => {
    const repository = { markAllRead: vi.fn(async () => 3) };
    await expect(new MarkAllNotificationsReadCommand(repository as never).execute('account-1')).resolves.toEqual({
      updated: 3,
    });
    expect(repository.markAllRead).toHaveBeenCalledWith('account-1');
  });

  it('purges Notifications after the fixed thirty-day retention window', async () => {
    let cutoff: string | undefined;
    const command = new PurgeOldNotificationsCommand({
      deleteCreatedBefore: vi.fn(async (value: string) => {
        cutoff = value;

        return 4;
      }),
    } as never);

    await expect(command.execute(new Date('2026-08-19T12:00:00.000Z'))).resolves.toBe(4);
    expect(cutoff).toBe('2026-07-20T12:00:00.000Z');
  });

  it('NTF-BE-UC-001 — CreateNotificationCommand delegates the causal fact without widening or rewriting recipient/source/target', async () => {
    const input = {
      accountId: 'account-1',
      type: 'question_answered' as const,
      sourceType: 'answer' as const,
      sourceId: 'answer-1',
      targetType: 'question' as const,
      targetId: 'question-1',
    };
    const notify = vi.fn(async () => ({ id: 'notification-1', ...input }));
    const command = new CreateNotificationCommand({ notify } as never);

    await expect(command.execute(input)).resolves.toEqual({ id: 'notification-1', ...input });
    expect(notify).toHaveBeenCalledWith(input);
  });

  it('preserves explicit causal source and navigation target in the created Notification fact', async () => {
    const persisted: NotificationRecord[] = [];
    const repository = {
      create: vi.fn(async (input) => {
        const record = {
          id: 'notification-1',
          ...input,
          seenAt: null,
          readAt: null,
          createdAt: '2026-08-18T00:00:00.000Z',
        } as NotificationRecord;
        persisted.push(record);

        return record;
      }),
    };
    const service = new NotificationPublicService(repository as never);
    const input = {
      accountId: 'account-1',
      type: 'question_answered' as const,
      sourceType: 'answer' as const,
      sourceId: 'answer-1',
      targetType: 'question' as const,
      targetId: 'question-1',
    };

    const result = await service.notify(input);

    expect(result).toEqual(persisted[0]);
    expect(persisted).toEqual([
      expect.objectContaining({
        accountId: 'account-1',
        type: 'question_answered',
        sourceType: 'answer',
        sourceId: 'answer-1',
        targetType: 'question',
        targetId: 'question-1',
        seenAt: null,
        readAt: null,
      }),
    ]);
  });

  it('treats notification persistence as best-effort and never turns its failure into failure of the primary owner fact', async () => {
    const repository = {
      create: vi.fn(async () => {
        throw new Error('delivery unavailable');
      }),
    };
    const service = new NotificationPublicService(repository as never);

    await expect(
      service.notify({
        accountId: 'account-1',
        type: 'question_answered',
        sourceType: 'answer',
        sourceId: 'answer-1',
        targetType: 'question',
        targetId: 'question-1',
      }),
    ).resolves.toBeNull();
  });
});
