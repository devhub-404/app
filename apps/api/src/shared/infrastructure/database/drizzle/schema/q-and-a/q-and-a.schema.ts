import { sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  foreignKey,
  index,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { resourcesSchema } from '../resource/resources.schema';
import { accountsSchema } from '../user/account/accounts.schema';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export const questionStatusEnum = pgEnum('question_status', ['open', 'closed']);

export const questionsSchema = pgTable(
  'questions',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => resourcesSchema.id, { onDelete: 'restrict' }),
    authorAccountId: uuid('author_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    title: varchar('title', { length: FIELD_LIMITS.title }).notNull(),
    content: varchar('content', { length: FIELD_LIMITS.body }).notNull(),
    status: questionStatusEnum('status').notNull().default('open'),
    acceptedAnswerId: uuid('accepted_answer_id'),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    hiddenAt: timestamp('hidden_at', { mode: 'string' }),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
  },
  (table) => [
    index('questions_status_created_idx').on(table.status, table.createdAt),
    index('questions_status_hidden_created_idx').on(table.status, table.hiddenAt, table.createdAt),
    foreignKey({
      columns: [table.acceptedAnswerId, table.id],
      foreignColumns: [answersSchema.id, answersSchema.questionId],
      name: 'questions_accepted_answer_same_question_fk',
    }),
  ],
);

export const answersSchema = pgTable(
  'answers',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => resourcesSchema.id, { onDelete: 'restrict' }),
    questionId: uuid('question_id')
      .notNull()
      .references((): AnyPgColumn => questionsSchema.id, { onDelete: 'restrict' }),
    authorAccountId: uuid('author_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    content: varchar('content', { length: FIELD_LIMITS.body }).notNull(),
    acceptedAt: timestamp('accepted_at', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    hiddenAt: timestamp('hidden_at', { mode: 'string' }),
    deletedAt: timestamp('deleted_at', { mode: 'string' }),
  },
  (table) => [
    index('answers_question_created_idx').on(table.questionId, table.createdAt),
    index('answers_question_hidden_created_idx').on(table.questionId, table.hiddenAt, table.createdAt),
    unique('answers_id_question_uq').on(table.id, table.questionId),
    uniqueIndex('answers_question_accepted_uidx')
      .on(table.questionId)
      .where(sql`${table.acceptedAt} is not null`),
  ],
);
