import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { accountsSchema } from '../account/accounts.schema';

export const mfaTotpStatusEnum = pgEnum('mfa_totp_status', ['pending', 'active', 'disabled']);

export const mfaTotpSchema = pgTable(
  'mfa_totp',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => accountsSchema.id, { onDelete: 'cascade' }),
    encryptedSecret: varchar('encrypted_secret', { length: 512 }).notNull(),
    status: mfaTotpStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [index('mfa_totp_user_idx').on(table.userId)],
);
