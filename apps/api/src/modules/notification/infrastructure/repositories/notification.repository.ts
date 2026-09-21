import { and, count, desc, eq, inArray, isNull, lt, or } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { notificationsSchema } from '@/shared/infrastructure/database/drizzle/schema/communication/notification.schema';
import { Notification, type NotificationCursor, type NotificationRecord } from '../../domain/notification';
import { NotificationRepository, type CreateNotificationRecord } from '../../application/ports/repositories';

@Injectable()
export class DrizzleNotificationRepository implements NotificationRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async create(input: CreateNotificationRecord): Promise<NotificationRecord | null> {
    const notification = Notification.create(randomUUID(), input);

    const query = this.db.insert(notificationsSchema).values({
      ...notification.value,
    });
    const rows = notification.value.sourceType
      ? await query.onConflictDoNothing().returning()
      : await query.returning();

    return (rows[0] ?? null) as NotificationRecord | null;
  }

  async list(accountId: string, cursor?: NotificationCursor): Promise<NotificationRecord[]> {
    if (!cursor) {
      return this.db
        .select()
        .from(notificationsSchema)
        .where(eq(notificationsSchema.accountId, accountId))
        .orderBy(desc(notificationsSchema.createdAt), desc(notificationsSchema.id))
        .limit(250) as Promise<NotificationRecord[]>;
    }

    const afterCursor = or(
      lt(notificationsSchema.createdAt, cursor.createdAt),
      and(eq(notificationsSchema.createdAt, cursor.createdAt), lt(notificationsSchema.id, cursor.id)),
    );

    return this.db
      .select()
      .from(notificationsSchema)
      .where(and(eq(notificationsSchema.accountId, accountId), afterCursor))
      .orderBy(desc(notificationsSchema.createdAt), desc(notificationsSchema.id))
      .limit(250) as Promise<NotificationRecord[]>;
  }

  async markSeen(accountId: string, ids: string[], seenAt: string): Promise<number> {
    if (ids.length === 0) return 0;
    const rows = await this.db
      .update(notificationsSchema)
      .set({ seenAt })
      .where(
        and(
          eq(notificationsSchema.accountId, accountId),
          inArray(notificationsSchema.id, ids),
          isNull(notificationsSchema.seenAt),
        ),
      )
      .returning({ id: notificationsSchema.id });

    return rows.length;
  }

  async unreadCount(accountId: string): Promise<number> {
    const [row] = await this.db
      .select({ value: count() })
      .from(notificationsSchema)
      .where(and(eq(notificationsSchema.accountId, accountId), isNull(notificationsSchema.readAt)));

    return Number(row?.value ?? 0);
  }

  async markRead(accountId: string, id: string): Promise<NotificationRecord | null> {
    const [current] = await this.db
      .select()
      .from(notificationsSchema)
      .where(and(eq(notificationsSchema.id, id), eq(notificationsSchema.accountId, accountId)))
      .limit(1);
    if (!current) return null;

    const notification = Notification.rehydrate(current as NotificationRecord);
    notification.markRead();
    if (current.readAt) return current as NotificationRecord;

    const [row] = await this.db
      .update(notificationsSchema)
      .set({ readAt: notification.value.readAt })
      .where(and(eq(notificationsSchema.id, id), eq(notificationsSchema.accountId, accountId)))
      .returning();

    return (row ?? null) as NotificationRecord | null;
  }

  async markAllRead(accountId: string): Promise<number> {
    const rows = await this.db
      .update(notificationsSchema)
      .set({ readAt: new Date().toISOString() })
      .where(and(eq(notificationsSchema.accountId, accountId), isNull(notificationsSchema.readAt)))
      .returning({ id: notificationsSchema.id });

    return rows.length;
  }

  async deleteCreatedBefore(cutoff: string): Promise<number> {
    const rows = await this.db
      .delete(notificationsSchema)
      .where(lt(notificationsSchema.createdAt, cutoff))
      .returning({ id: notificationsSchema.id });

    return rows.length;
  }

  async deleteByAccountId(accountId: string): Promise<number> {
    const rows = await this.db
      .delete(notificationsSchema)
      .where(eq(notificationsSchema.accountId, accountId))
      .returning({ id: notificationsSchema.id });

    return rows.length;
  }
}
