import { boolean, index, pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { resourcesSchema } from '../resource/resources.schema';
import { accountsSchema } from '../user/account/accounts.schema';

export const resourceVotesSchema = pgTable(
  'resource_votes',
  {
    resourceId: uuid('resource_id')
      .notNull()
      .references(() => resourcesSchema.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accountsSchema.id, { onDelete: 'cascade' }),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.accountId, table.resourceId] }),
    index('resource_votes_resource_active_idx').on(table.resourceId, table.active),
  ],
);
