import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { accountsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/accounts.schema';

export const accountEmailTypeEnum = pgEnum('user_email_type', ['primary', 'backup']);

export const accountEmailsSchema = pgTable(
  'account_emails',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => accountsSchema.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 320 }).notNull().unique(),
    type: accountEmailTypeEnum('type').notNull(),
    verifiedAt: timestamp('verified_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => ({
    userTypeIdx: uniqueIndex('account_emails_account_type_idx').on(table.userId, table.type),
    emailLowerIdx: uniqueIndex('account_emails_email_lower_idx').on(sql`lower(${table.email})`),
  }),
);
