import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTable, timestamp, text, uuid } from 'drizzle-orm/pg-core';
import { accountsSchema } from '../user/account/accounts.schema';

export const restrictionCapabilityEnum = pgEnum('restriction_capability', [
  'CONTRIBUTION',
  'COMMENT',
  'VOTE',
  'JOB_PUBLISH',
]);

export const accountRestrictionsSchema = pgTable(
  'account_restrictions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accountsSchema.id, { onDelete: 'cascade' }),
    capability: restrictionCapabilityEnum('capability').notNull(),
    reason: text('reason').notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true, mode: 'string' }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true, mode: 'string' }),
    appliedByAccountId: uuid('applied_by_account_id')
      .notNull()
      .references(() => accountsSchema.id, { onDelete: 'restrict' }),
    revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'string' }),
    revokedByAccountId: uuid('revoked_by_account_id').references(() => accountsSchema.id, { onDelete: 'set null' }),
    revokeReason: text('revoke_reason'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    index('account_restrictions_account_idx').on(table.accountId, table.capability),
    index('account_restrictions_effective_idx').on(table.accountId, table.capability, table.startsAt, table.endsAt),
  ],
);
