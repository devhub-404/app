import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { mediaObjectsSchema } from '../media/media-objects.schema';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';
import { resourcesSchema } from '../resource/resources.schema';
import { accountsSchema } from '../user/account/accounts.schema';

export const eventStatusEnum = pgEnum('event_status', ['draft', 'published', 'archived']);
export const eventFormatEnum = pgEnum('event_format', ['online', 'in_person', 'hybrid']);

export const eventsSchema = pgTable(
  'events',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => resourcesSchema.id, { onDelete: 'restrict' }),
    title: varchar('title', { length: FIELD_LIMITS.title }).notNull(),
    slug: varchar('slug', { length: FIELD_LIMITS.slug }).notNull(),
    description: varchar('description', { length: FIELD_LIMITS.body }).notNull(),
    coverMediaId: uuid('cover_media_id').references(() => mediaObjectsSchema.id, { onDelete: 'set null' }),
    url: varchar('url', { length: FIELD_LIMITS.url }).notNull(),
    startsAt: timestamp('starts_at', { mode: 'string', withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { mode: 'string', withTimezone: true }).notNull(),
    format: eventFormatEnum('format').notNull(),
    location: varchar('location', { length: FIELD_LIMITS.location }),
    status: eventStatusEnum('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { mode: 'string', withTimezone: true }),
    deletedAt: timestamp('deleted_at', { mode: 'string', withTimezone: true }),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('events_slug_unique_idx').on(t.slug),
    uniqueIndex('events_url_unique_idx')
      .on(t.url)
      .where(sql`${t.deletedAt} is null`),
    index('events_discovery_idx').on(t.status, t.startsAt, t.endsAt),
  ],
);

export const eventSuggestionStatusEnum = pgEnum('event_suggestion_status', ['pending', 'accepted', 'rejected']);

export const eventSuggestionsSchema = pgTable(
  'event_suggestions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    url: varchar('url', { length: FIELD_LIMITS.url }).notNull(),
    submittedByAccountId: uuid('submitted_by_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    status: eventSuggestionStatusEnum('status').notNull().default('pending'),
    acceptedEventId: uuid('accepted_event_id').references(() => eventsSchema.id, { onDelete: 'set null' }),
    decidedByAccountId: uuid('decided_by_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    decisionNote: varchar('decision_note', { length: FIELD_LIMITS.reviewNote }),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    decidedAt: timestamp('decided_at', { mode: 'string', withTimezone: true }),
  },
  (t) => [
    uniqueIndex('event_suggestions_pending_url_uidx')
      .on(t.url)
      .where(sql`${t.status} = 'pending'`),
    index('event_suggestions_submitter_idx').on(t.submittedByAccountId, t.createdAt),
    index('event_suggestions_status_idx').on(t.status, t.createdAt),
  ],
);
