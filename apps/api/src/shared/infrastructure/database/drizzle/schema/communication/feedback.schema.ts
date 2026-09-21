import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { accountsSchema } from '../user/account/accounts.schema';
import { mediaObjectsSchema } from '../media/media-objects.schema';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export const feedbackCategoryEnum = pgEnum('feedback_category', ['bug', 'issue', 'suggestion']);
export const feedbackStatusEnum = pgEnum('feedback_status', ['open', 'in_review', 'resolved', 'dismissed']);

export const feedbackSchema = pgTable(
  'feedback',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    reporterAccountId: uuid('reporter_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    idempotencyKey: varchar('idempotency_key', { length: FIELD_LIMITS.idempotencyKey }),
    category: feedbackCategoryEnum('category').notNull(),
    description: varchar('description', { length: FIELD_LIMITS.body }).notNull(),
    contextUrl: varchar('context_url', { length: FIELD_LIMITS.url }),
    screenshotMediaId: uuid('screenshot_media_id').references(() => mediaObjectsSchema.id, { onDelete: 'set null' }),
    status: feedbackStatusEnum('status').notNull().default('open'),
    internalSeverity: varchar('internal_severity', { length: FIELD_LIMITS.internalSeverity }),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at', { mode: 'string', withTimezone: true }),
  },
  (t) => [
    index('feedback_reporter_created_idx').on(t.reporterAccountId, t.createdAt),
    index('feedback_status_created_idx').on(t.status, t.createdAt),
    uniqueIndex('feedback_reporter_idempotency_uidx')
      .on(t.reporterAccountId, t.idempotencyKey)
      .where(sql`${t.idempotencyKey} is not null`),
  ],
);
