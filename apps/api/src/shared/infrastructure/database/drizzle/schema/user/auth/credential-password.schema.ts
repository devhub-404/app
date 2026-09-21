import { integer, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { credentialSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential.schema';

export const passwordSchemeEnum = pgEnum('password_scheme', ['OPAQUE']);

export const credentialPasswordSchema = pgTable('credential_password', {
  id: uuid('id')
    .primaryKey()
    .references(() => credentialSchema.id, { onDelete: 'cascade' }),
  verifier: varchar('verifier', { length: 512 }).notNull(),
  opaqueUserIdentifier: varchar('opaque_user_identifier', { length: 128 }).notNull(),
  scheme: passwordSchemeEnum('scheme').notNull().default('OPAQUE'),
  failedAttempts: integer('failed_attempts').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true, mode: 'date' }),
});
