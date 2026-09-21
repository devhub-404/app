import { boolean, index, pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { resourcesSchema } from '../resource/resources.schema';
import { accountsSchema } from '../user/account/accounts.schema';

export const resourceBookmarksSchema = pgTable(
  'resource_bookmarks',
  {
    accountId: uuid('account_id')
      .notNull()
      .references(() => accountsSchema.id, { onDelete: 'cascade' }),
    resourceId: uuid('resource_id')
      .notNull()
      .references(() => resourcesSchema.id, { onDelete: 'cascade' }),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.accountId, table.resourceId] }),
    index('resource_bookmarks_account_active_updated_idx').on(table.accountId, table.active, table.updatedAt),
    index('resource_bookmarks_resource_active_idx').on(table.resourceId, table.active),
  ],
);
