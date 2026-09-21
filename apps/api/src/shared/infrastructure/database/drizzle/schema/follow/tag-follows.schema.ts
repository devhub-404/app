import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { tagsSchema } from '../taxonomy/tags.schema';
import { accountsSchema } from '../user/account/accounts.schema';

export const tagFollowsSchema = pgTable(
  'tag_follows',
  {
    accountId: uuid('account_id')
      .notNull()
      .references(() => accountsSchema.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tagsSchema.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.accountId, table.tagId] })],
);
