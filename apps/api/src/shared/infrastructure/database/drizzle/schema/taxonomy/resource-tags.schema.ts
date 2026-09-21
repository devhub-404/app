import { index, pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { resourcesSchema } from '../resource/resources.schema';
import { tagsSchema } from './tags.schema';

/** Resource↔tag classification with relational identity on both sides. */
export const resourceTagAssignmentsSchema = pgTable(
  'resource_tags',
  {
    resourceId: uuid('resource_id')
      .notNull()
      .references(() => resourcesSchema.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .references(() => tagsSchema.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.resourceId, table.tagId] }),
    index('resource_tags_by_tag_idx').on(table.tagId, table.resourceId),
  ],
);
