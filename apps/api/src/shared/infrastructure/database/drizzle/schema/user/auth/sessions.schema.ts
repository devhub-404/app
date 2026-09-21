import { sql } from 'drizzle-orm';
import { index, inet, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { credentialSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential.schema';

export const authMethodEnum = pgEnum('auth_method', ['password', 'magic_link', 'oauth', 'passkey', 'restore_access']);

export const sessionsSchema = pgTable(
  'sessions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    userId: uuid('user_id').notNull(),
    credentialId: uuid('credential_id').references(() => credentialSchema.id, { onDelete: 'set null' }),
    authMethod: authMethodEnum('auth_method').notNull(),
    sessionSecretHash: varchar('session_secret_hash', { length: 255 }).notNull(),
    ipAddress: inet('ip_address'),
    userAgent: varchar('user_agent', { length: 512 }),
    deviceName: varchar('device_name', { length: 100 }),
    lastProofOfPossessionAt: timestamp('last_proof_of_possession_at', { withTimezone: true, mode: 'date' }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('sessions_user_idx').on(table.userId),
    sessionSecretHashIdx: uniqueIndex('sessions_secret_hash_idx').on(table.sessionSecretHash),
  }),
);
