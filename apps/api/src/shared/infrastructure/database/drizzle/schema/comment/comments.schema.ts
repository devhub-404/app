import { sql } from 'drizzle-orm';
import { check, foreignKey, index, pgTable, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core';
import { resourcesSchema } from '../resource/resources.schema';
import { accountsSchema } from '../user/account/accounts.schema';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export const commentsSchema = pgTable(
  'comments',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    resourceId: uuid('resource_id')
      .notNull()
      .references(() => resourcesSchema.id, { onDelete: 'cascade' }),
    authorAccountId: uuid('author_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    parentId: uuid('parent_id'),
    body: varchar('body', { length: FIELD_LIMITS.comment }),
    editedAt: timestamp('edited_at', { mode: 'string' }),
    hiddenAt: timestamp('hidden_at', { mode: 'string' }),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    unique('comments_id_resource_uq').on(table.id, table.resourceId),
    index('comments_resource_created_idx').on(table.resourceId, table.createdAt.asc()),
    index('comments_parent_id_idx').on(table.parentId),
    foreignKey({
      columns: [table.parentId, table.resourceId],
      foreignColumns: [table.id, table.resourceId],
      name: 'comments_parent_same_resource_fk',
    }),
    check(
      'comments_tombstone_consistency',
      sql`(${table.deletedAt} IS NULL AND ${table.body} IS NOT NULL) OR (${table.deletedAt} IS NOT NULL AND ${table.body} IS NULL)`,
    ),
  ],
);
