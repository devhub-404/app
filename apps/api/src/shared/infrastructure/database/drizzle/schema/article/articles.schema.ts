import { boolean, index, integer, pgEnum, pgTable, smallint, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { mediaObjectsSchema } from '../media/media-objects.schema';
import { resourcesSchema } from '../resource/resources.schema';
import { accountsSchema } from '../user/account/accounts.schema';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export const articleStatusEnum = pgEnum('article_status', ['draft', 'archived', 'published']);

export const articlesSchema = pgTable(
  'articles',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => resourcesSchema.id, { onDelete: 'restrict' }),
    authorId: uuid('author_id')
      .notNull()
      .references(() => accountsSchema.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: FIELD_LIMITS.title }).notNull(),
    description: varchar('description', { length: FIELD_LIMITS.shortDescription }).notNull(),
    slug: varchar('slug', { length: FIELD_LIMITS.slug }).unique().notNull(),
    coverMediaId: uuid('cover_media_id').references(() => mediaObjectsSchema.id, { onDelete: 'set null' }),
    content: varchar('content', { length: FIELD_LIMITS.body }).notNull(),
    contentVersion: integer('content_version').notNull().default(1),
    readingTimeMinutes: smallint('reading_time_minutes').default(1).notNull(),
    commentsEnabled: boolean('comments_enabled').notNull().default(true),
    status: articleStatusEnum('status').default('draft').notNull(),
    publishedAt: timestamp('published_at', { mode: 'string' }),
    hiddenAt: timestamp('hidden_at', { mode: 'string' }),
    hideReason: varchar('hide_reason', { length: FIELD_LIMITS.hideReason }),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
  },
  (table) => [
    index('articles_author_id_status_idx').on(table.authorId, table.status),
    index('articles_title_idx').on(table.title),
    index('articles_reading_time_minutes_idx').on(table.readingTimeMinutes),
    index('articles_published_at_idx').on(table.publishedAt),
  ],
);
