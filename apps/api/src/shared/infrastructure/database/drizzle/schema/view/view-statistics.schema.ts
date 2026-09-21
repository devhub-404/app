import { integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { resourcesSchema } from '../resource/resources.schema';

export const viewStatisticsSchema = pgTable('view_statistics', {
  resourceId: uuid('resource_id')
    .primaryKey()
    .references(() => resourcesSchema.id, { onDelete: 'cascade' }),
  viewCount: integer('view_count').notNull().default(0),
  updatedAt: timestamp('updated_at', { mode: 'string' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
});
