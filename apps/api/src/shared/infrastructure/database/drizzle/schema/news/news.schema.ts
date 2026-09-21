import { sql } from 'drizzle-orm';
import { boolean, index, integer, pgEnum, pgTable, timestamp, uuid, varchar, uniqueIndex } from 'drizzle-orm/pg-core';
import { mediaObjectsSchema } from '../media/media-objects.schema';
import { resourcesSchema } from '../resource/resources.schema';
import { accountsSchema } from '../user/account/accounts.schema';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export const newsStatusEnum = pgEnum('news_status', ['draft', 'published', 'archived']);

export const newsSchema = pgTable(
  'news',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => resourcesSchema.id, { onDelete: 'restrict' }),
    title: varchar('title', { length: FIELD_LIMITS.title }).notNull(),
    description: varchar('description', { length: FIELD_LIMITS.shortDescription }).notNull(),
    slug: varchar('slug', { length: FIELD_LIMITS.slug }).unique().notNull(),
    coverMediaId: uuid('cover_media_id').references(() => mediaObjectsSchema.id, { onDelete: 'set null' }),
    content: varchar('content', { length: FIELD_LIMITS.body }).notNull(),
    contentVersion: integer('content_version').notNull().default(1),
    commentsEnabled: boolean('comments_enabled').notNull().default(true),
    status: newsStatusEnum('status').notNull().default('draft'),
    occurredAt: timestamp('occurred_at', { mode: 'string' }),
    publishedAt: timestamp('published_at', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
  },
  (table) => [index('news_title_idx').on(table.title), index('news_published_at_idx').on(table.publishedAt)],
);

export const sourcesSchema = pgTable('sources', {
  id: uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`),
  name: varchar('name', { length: FIELD_LIMITS.sourceName }).notNull(),
  domain: varchar('domain', { length: FIELD_LIMITS.domain }).notNull().unique(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

export const newsReferencesSchema = pgTable(
  'news_references',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    newsId: uuid('news_id')
      .notNull()
      .references(() => newsSchema.id, { onDelete: 'cascade' }),
    sourceId: uuid('source_id')
      .notNull()
      .references(() => sourcesSchema.id, { onDelete: 'restrict' }),
    url: varchar('url', { length: FIELD_LIMITS.url }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('news_references_news_url_uidx').on(table.newsId, table.url),
    index('news_references_source_idx').on(table.sourceId),
  ],
);

export const newsSuggestionStatusEnum = pgEnum('news_suggestion_status', ['pending', 'accepted', 'rejected']);
export const newsSuggestionsSchema = pgTable(
  'news_suggestions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    url: varchar('url', { length: FIELD_LIMITS.url }).notNull(),
    submittedByAccountId: uuid('submitted_by_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    status: newsSuggestionStatusEnum('status').notNull().default('pending'),
    acceptedNewsId: uuid('accepted_news_id').references(() => newsSchema.id, { onDelete: 'set null' }),
    decidedByAccountId: uuid('decided_by_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    decisionNote: varchar('decision_note', { length: FIELD_LIMITS.reviewNote }),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    decidedAt: timestamp('decided_at', { mode: 'string' }),
  },
  (table) => [
    uniqueIndex('news_suggestions_pending_url_uidx')
      .on(table.url)
      .where(sql`${table.status} = 'pending'`),
    index('news_suggestions_status_idx').on(table.status, table.createdAt),
  ],
);
