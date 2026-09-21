import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { commentsSchema } from '../comment/comments.schema';
import { resourcesSchema } from '../resource/resources.schema';
import { accountsSchema } from '../user/account/accounts.schema';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export const reportStatusEnum = pgEnum('report_status', ['pending', 'resolved', 'dismissed']);

export const resourceReportsSchema = pgTable(
  'resource_reports',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    resourceId: uuid('resource_id')
      .notNull()
      .references(() => resourcesSchema.id, { onDelete: 'cascade' }),
    reporterAccountId: uuid('reporter_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    reason: varchar('reason', { length: FIELD_LIMITS.reportReason }).notNull(),
    description: varchar('description', { length: FIELD_LIMITS.reviewNote }),
    status: reportStatusEnum('status').notNull().default('pending'),
    reviewedByAccountId: uuid('reviewed_by_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    decisionNote: varchar('decision_note', { length: FIELD_LIMITS.reviewNote }),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    reviewedAt: timestamp('reviewed_at', { mode: 'string' }),
  },
  (t) => [
    uniqueIndex('resource_reports_pending_reporter_resource_uidx')
      .on(t.reporterAccountId, t.resourceId)
      .where(sql`${t.status} = 'pending'`),
    index('resource_reports_status_created_idx').on(t.status, t.createdAt),
  ],
);

export const commentReportsSchema = pgTable(
  'comment_reports',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    commentId: uuid('comment_id')
      .notNull()
      .references(() => commentsSchema.id, { onDelete: 'cascade' }),
    reporterAccountId: uuid('reporter_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    reason: varchar('reason', { length: FIELD_LIMITS.reportReason }).notNull(),
    description: varchar('description', { length: FIELD_LIMITS.reviewNote }),
    status: reportStatusEnum('status').notNull().default('pending'),
    reviewedByAccountId: uuid('reviewed_by_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    decisionNote: varchar('decision_note', { length: FIELD_LIMITS.reviewNote }),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    reviewedAt: timestamp('reviewed_at', { mode: 'string' }),
  },
  (t) => [
    uniqueIndex('comment_reports_pending_reporter_comment_uidx')
      .on(t.reporterAccountId, t.commentId)
      .where(sql`${t.status} = 'pending'`),
    index('comment_reports_status_created_idx').on(t.status, t.createdAt),
  ],
);
