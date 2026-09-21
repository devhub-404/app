import { sql } from 'drizzle-orm';
import { check, index, jsonb, numeric, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { resourcesSchema } from '../resource/resources.schema';
import { accountsSchema } from '../user/account/accounts.schema';
import { organizationsSchema } from '../user/organization/organizations.schema';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export const jobTypeEnum = pgEnum('job_type', ['full_time', 'part_time', 'contract', 'internship', 'temporary']);
export const workplaceTypeEnum = pgEnum('job_workplace_type', ['remote', 'hybrid', 'onsite']);
export const compensationUnitEnum = pgEnum('job_compensation_unit', [
  'hourly',
  'daily',
  'monthly',
  'yearly',
  'fixed_project',
]);
export const jobStatusEnum = pgEnum('job_status', ['published', 'closed', 'expired', 'withdrawn']);

export const jobsSchema = pgTable(
  'jobs',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => resourcesSchema.id, { onDelete: 'restrict' }),
    publisherOrganizationId: uuid('publisher_organization_id').references(() => organizationsSchema.id, {
      onDelete: 'restrict',
    }),
    title: varchar('title', { length: FIELD_LIMITS.title }).notNull(),
    description: varchar('description', { length: FIELD_LIMITS.body }).notNull(),
    employmentType: jobTypeEnum('employment_type').notNull(),
    workplaceType: workplaceTypeEnum('workplace_type').notNull(),
    location: varchar('location', { length: FIELD_LIMITS.location }),
    compensationMin: numeric('compensation_min', { precision: 14, scale: 2 }),
    compensationMax: numeric('compensation_max', { precision: 14, scale: 2 }),
    compensationCurrency: varchar('compensation_currency', { length: 3 }),
    compensationUnit: compensationUnitEnum('compensation_unit'),
    applicationUrl: varchar('application_url', { length: FIELD_LIMITS.url }).notNull(),
    sourceUrl: varchar('source_url', { length: FIELD_LIMITS.url }),
    status: jobStatusEnum('status').notNull().default('published'),
    publishedAt: timestamp('published_at', { mode: 'string' }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
    closedAt: timestamp('closed_at', { mode: 'string' }),
    withdrawnAt: timestamp('withdrawn_at', { mode: 'string' }),
    hiddenAt: timestamp('hidden_at', { mode: 'string' }),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (t) => [
    check(
      'jobs_compensation_ck',
      sql`(${t.compensationMin} IS NULL AND ${t.compensationMax} IS NULL AND ${t.compensationCurrency} IS NULL AND ${t.compensationUnit} IS NULL) OR (${t.compensationMin} IS NOT NULL AND (${t.compensationMax} IS NULL OR ${t.compensationMax} >= ${t.compensationMin}) AND ${t.compensationCurrency} IS NOT NULL AND ${t.compensationUnit} IS NOT NULL)`,
    ),
    check('jobs_application_url_https_ck', sql`${t.applicationUrl} ~* '^https://'`),
    check('jobs_source_url_https_ck', sql`${t.sourceUrl} IS NULL OR ${t.sourceUrl} ~* '^https://'`),
    index('jobs_active_expiry_idx').on(t.status, t.expiresAt),
    index('jobs_organization_status_idx').on(t.publisherOrganizationId, t.status),
  ],
);

export const jobSuggestionStatusEnum = pgEnum('job_suggestion_status', ['pending', 'accepted', 'rejected']);
export const jobSuggestionsSchema = pgTable(
  'job_suggestions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    submittedByAccountId: uuid('submitted_by_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    title: varchar('title', { length: FIELD_LIMITS.title }).notNull(),
    description: varchar('description', { length: FIELD_LIMITS.body }).notNull(),
    employmentType: jobTypeEnum('employment_type').notNull(),
    workplaceType: workplaceTypeEnum('workplace_type').notNull(),
    location: varchar('location', { length: FIELD_LIMITS.location }),
    compensationMin: numeric('compensation_min', { precision: 14, scale: 2 }),
    compensationMax: numeric('compensation_max', { precision: 14, scale: 2 }),
    compensationCurrency: varchar('compensation_currency', { length: 3 }),
    compensationUnit: compensationUnitEnum('compensation_unit'),
    applicationUrl: varchar('application_url', { length: FIELD_LIMITS.url }).notNull(),
    sourceUrl: varchar('source_url', { length: FIELD_LIMITS.url }),
    tagSlugs: jsonb('tag_slugs')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    status: jobSuggestionStatusEnum('status').notNull().default('pending'),
    acceptedJobId: uuid('accepted_job_id').references(() => jobsSchema.id, { onDelete: 'set null' }),
    decidedByAccountId: uuid('decided_by_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    decisionNote: varchar('decision_note', { length: FIELD_LIMITS.reviewNote }),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    decidedAt: timestamp('decided_at', { mode: 'string' }),
  },
  (t) => [
    index('job_suggestions_status_idx').on(t.status, t.createdAt),
    index('job_suggestions_submitter_idx').on(t.submittedByAccountId, t.createdAt),
  ],
);
