import { sql } from 'drizzle-orm';
import { boolean, index, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

export const accountVoluntaryStatusEnum = pgEnum('account_voluntary_status', ['active', 'deactivated']);
export const accountModerationStatusEnum = pgEnum('account_moderation_status', ['none', 'suspended', 'banned']);
export const accountDeletionStatusEnum = pgEnum('account_deletion_status', ['none', 'pending']);

export const accountsSchema = pgTable(
  'accounts',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    voluntaryStatus: accountVoluntaryStatusEnum('voluntary_status').notNull().default('active'),
    moderationStatus: accountModerationStatusEnum('moderation_status').notNull().default('none'),
    deletionStatus: accountDeletionStatusEnum('deletion_status').notNull().default('none'),
    deletionRequestedAt: timestamp('deletion_requested_at', { withTimezone: true, mode: 'date' }),
    mfaEnabled: boolean('mfa_enabled').notNull().default(false),
    lockedUntil: timestamp('locked_until', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => ({
    voluntaryStatusIdx: index('accounts_voluntary_status_idx').on(table.voluntaryStatus),
    moderationStatusIdx: index('accounts_moderation_status_idx').on(table.moderationStatus),
    deletionStatusIdx: index('accounts_deletion_status_idx').on(table.deletionStatus),
    deletionRequestedAtIdx: index('accounts_deletion_requested_at_idx').on(table.deletionRequestedAt),
  }),
);
