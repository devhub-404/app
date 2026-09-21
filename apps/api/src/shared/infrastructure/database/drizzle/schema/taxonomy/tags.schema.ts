import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const tagStatusEnum = pgEnum('tag_status', ['active', 'archived']);

export const tagsSchema = pgTable('tags', {
  id: uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`),
  name: varchar({ length: 32 }).notNull(),
  slug: varchar({ length: 32 }).unique().notNull(),
  status: tagStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});
