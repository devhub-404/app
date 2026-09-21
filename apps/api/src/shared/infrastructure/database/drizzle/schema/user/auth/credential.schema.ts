import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { accountsSchema } from '../account/accounts.schema';

export const credentialTypeEnum = pgEnum('credential_type', ['password', 'oauth', 'passkey']);

export const credentialSchema = pgTable(
  'credential',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => accountsSchema.id, { onDelete: 'cascade' }),
    type: credentialTypeEnum('type').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => ({
    userTypeIdx: index('credential_user_type_idx').on(table.userId, table.type),
  }),
);
