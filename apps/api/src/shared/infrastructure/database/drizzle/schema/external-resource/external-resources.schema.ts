import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { resourcesSchema } from '../resource/resources.schema';
import { accountsSchema } from '../user/account/accounts.schema';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export const externalResourceStatusEnum = pgEnum('external_resource_status', ['active', 'archived']);

export const externalResourcesSchema = pgTable(
  'external_resources',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => resourcesSchema.id, { onDelete: 'restrict' }),
    title: varchar('title', { length: FIELD_LIMITS.title }).notNull(),
    description: varchar('description', { length: FIELD_LIMITS.shortDescription }).notNull(),
    url: varchar('url', { length: FIELD_LIMITS.url }).notNull(),
    status: externalResourceStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
  },
  (table) => [
    index('external_resources_title_idx').on(table.title),
    uniqueIndex('external_resources_active_url_uidx')
      .on(table.url)
      .where(sql`${table.status} in ('active', 'archived')`),
  ],
);

export const externalResourceSuggestionStatusEnum = pgEnum('external_resource_suggestion_status', [
  'pending',
  'accepted',
  'rejected',
]);

export const externalResourceSuggestionsSchema = pgTable(
  'external_resource_suggestions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    acceptedExternalResourceId: uuid('accepted_external_resource_id').references(() => externalResourcesSchema.id, {
      onDelete: 'set null',
    }),
    submittedByAccountId: uuid('submitted_by_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    url: varchar('url', { length: FIELD_LIMITS.url }).notNull(),
    status: externalResourceSuggestionStatusEnum('status').notNull().default('pending'),
    decisionNote: varchar('decision_note', { length: FIELD_LIMITS.reviewNote }),
    decidedByAccountId: uuid('decided_by_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    decidedAt: timestamp('decided_at', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    index('external_resource_suggestions_status_idx').on(table.status, table.createdAt),
    uniqueIndex('external_resource_suggestions_pending_url_uidx')
      .on(table.url)
      .where(sql`${table.status} = 'pending'`),
  ],
);
