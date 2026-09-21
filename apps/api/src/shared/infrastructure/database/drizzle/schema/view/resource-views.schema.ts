import { index, pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { resourcesSchema } from '../resource/resources.schema';
import { accountsSchema } from '../user/account/accounts.schema';

export const resourceViewsSchema = pgTable(
  'resource_views',
  {
    accountId: uuid('account_id')
      .notNull()
      .references(() => accountsSchema.id, { onDelete: 'cascade' }),
    resourceId: uuid('resource_id')
      .notNull()
      .references(() => resourcesSchema.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.accountId, table.resourceId] }),
    index('resource_views_resource_idx').on(table.resourceId),
  ],
);
