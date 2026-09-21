import { integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { resourcesSchema } from '../resource/resources.schema';

export const voteStatisticsSchema = pgTable('vote_statistics', {
  resourceId: uuid('resource_id')
    .primaryKey()
    .references(() => resourcesSchema.id, { onDelete: 'cascade' }),
  voteCount: integer('vote_count').notNull().default(0),
  updatedAt: timestamp('updated_at', { mode: 'string' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`now()`),
});
