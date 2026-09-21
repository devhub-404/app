import { sql } from 'drizzle-orm';
import { index, integer, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { accountsSchema } from '../user/account/accounts.schema';

export const mediaObjectPurposeEnum = pgEnum('media_object_purpose', ['avatar', 'content']);

export const mediaObjectStatusEnum = pgEnum('media_object_status', ['pending', 'confirmed', 'deleted']);

export const mediaObjectsSchema = pgTable(
  'media_objects',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    ownerAccountId: uuid('owner_account_id')
      .notNull()
      .references(() => accountsSchema.id, { onDelete: 'restrict' }),
    purpose: mediaObjectPurposeEnum('purpose').notNull(),
    objectKey: varchar('object_key', { length: 1024 }).notNull(),
    contentType: varchar('content_type', { length: 128 }).notNull(),
    size: integer('size').notNull(),
    status: mediaObjectStatusEnum('status').notNull().default('pending'),
    confirmedAt: timestamp('confirmed_at', { mode: 'string' }),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('media_objects_object_key_uidx').on(table.objectKey),
    index('media_objects_owner_status_idx').on(table.ownerAccountId, table.status),
    index('media_objects_pending_created_at_idx').on(table.status, table.createdAt),
  ],
);
