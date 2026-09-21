import { index, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { resourcesSchema } from '../resource/resources.schema';
import { accountsSchema } from '../user/account/accounts.schema';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export const projectStatusEnum = pgEnum('project_status', ['draft', 'published', 'archived']);

export const projectsSchema = pgTable(
  'projects',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => resourcesSchema.id, { onDelete: 'restrict' }),
    authorAccountId: uuid('author_account_id')
      .notNull()
      .references(() => accountsSchema.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: FIELD_LIMITS.title }).notNull(),
    slug: varchar('slug', { length: FIELD_LIMITS.slug }).notNull().unique(),
    summary: varchar('summary', { length: FIELD_LIMITS.shortDescription }).notNull(),
    description: varchar('description', { length: FIELD_LIMITS.body }).notNull(),
    projectUrl: varchar('project_url', { length: FIELD_LIMITS.url }),
    repositoryUrl: varchar('repository_url', { length: FIELD_LIMITS.url }),
    status: projectStatusEnum('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { mode: 'string' }),
    hiddenAt: timestamp('hidden_at', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
  },
  (t) => [
    index('projects_author_status_idx').on(t.authorAccountId, t.status),
    index('projects_published_idx').on(t.publishedAt),
  ],
);
