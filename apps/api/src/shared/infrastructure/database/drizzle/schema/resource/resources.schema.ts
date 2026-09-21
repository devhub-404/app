import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, uuid } from 'drizzle-orm/pg-core';

/**
 * Shared relational identity for server-owned resources.
 *
 * This table deliberately owns no business state. Lifecycle, authorship,
 * visibility, publication and moderation remain responsibilities of each
 * semantic owner table.
 */
export const resourceKindEnum = pgEnum('resource_kind', [
  'article',
  'news',
  'external_resource',
  'project',
  'event',
  'job',
  'question',
  'answer',
]);

export type ResourceKind = (typeof resourceKindEnum.enumValues)[number];

export const resourcesSchema = pgTable('resources', {
  id: uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`),
  kind: resourceKindEnum('kind').notNull(),
});
