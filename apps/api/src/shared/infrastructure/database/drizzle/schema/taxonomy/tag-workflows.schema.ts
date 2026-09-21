import { pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { tagsSchema } from '@/shared/infrastructure/database/drizzle/schema/taxonomy/tags.schema';
import { accountsSchema } from '../user/account/accounts.schema';

export const tagMergesSchema = pgTable(
  'tag_merges',
  {
    sourceTagId: uuid('source_tag_id')
      .references(() => tagsSchema.id, { onDelete: 'cascade' })
      .notNull(),
    targetTagId: uuid('target_tag_id')
      .references(() => tagsSchema.id, { onDelete: 'cascade' })
      .notNull(),
    mergedById: uuid('merged_by_id')
      .notNull()
      .references(() => accountsSchema.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('tag_merges_source_unique').on(table.sourceTagId)],
);
