import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { accountsSchema } from '../account/accounts.schema';
export const authFlowProofSchema = pgTable(
  'auth_flow_proof',
  {
    // JTI is deliberately ephemeral/random; ARCH-RNF-015 explicitly permits
    // random UUIDs for nonce/JTI values even though persistent entity PKs use UUIDv7.
    jti: uuid('jti').primaryKey(),
    purpose: varchar('purpose', { length: 64 }).notNull(),
    subjectId: uuid('subject_id').references(() => accountsSchema.id, { onDelete: 'cascade' }),
    codeHash: varchar('code_hash', { length: 255 }),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => ({
    expiryIdx: index('auth_flow_proof_expiry_idx').on(table.expiresAt),
    subjectPurposeIdx: index('auth_flow_proof_subject_purpose_idx').on(table.subjectId, table.purpose),
  }),
);
