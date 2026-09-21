import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { tagsSchema } from '@/shared/infrastructure/database/drizzle/schema/taxonomy/tags.schema';

export const tagIdentityTermKindEnum = pgEnum('tag_identity_term_kind', ['reserved', 'blocked']);

export const tagAliasesSchema = pgTable(
  'tag_aliases',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tagsSchema.id, { onDelete: 'cascade' }),
    alias: varchar('alias', { length: 32 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('tag_aliases_alias_unique').on(table.alias), index('tag_aliases_tag_id_idx').on(table.tagId)],
);

export const tagIdentityTermsSchema = pgTable(
  'tag_identity_terms',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    value: varchar('value', { length: 32 }).notNull(),
    kind: tagIdentityTermKindEnum('kind').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('tag_identity_terms_value_unique').on(table.value)],
);
