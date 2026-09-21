import { index, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { accountsSchema } from '../user/account/accounts.schema';

export const notificationsSchema = pgTable(
  'notifications',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accountsSchema.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 64 }).notNull(),
    targetType: varchar('target_type', { length: 64 }),
    targetId: varchar('target_id', { length: 255 }),
    sourceType: varchar('source_type', { length: 64 }),
    sourceId: varchar('source_id', { length: 255 }),
    seenAt: timestamp('seen_at', { mode: 'string' }),
    readAt: timestamp('read_at', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    index('notifications_account_created_idx').on(table.accountId, table.createdAt, table.id),
    index('notifications_account_seen_idx').on(table.accountId, table.seenAt),
    index('notifications_account_read_idx').on(table.accountId, table.readAt),
    index('notifications_created_idx').on(table.createdAt),
    uniqueIndex('notifications_account_type_source_uq')
      .on(table.accountId, table.type, table.sourceType, table.sourceId)
      .where(sql`${table.sourceType} is not null and ${table.sourceId} is not null`),
  ],
);
