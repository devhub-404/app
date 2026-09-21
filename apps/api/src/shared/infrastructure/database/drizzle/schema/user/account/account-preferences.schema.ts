import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { accountsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/accounts.schema';

export const profileVisibilityEnum = pgEnum('profile_visibility', ['public', 'private']);

export const accountPreferencesSchema = pgTable('account_preferences', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => accountsSchema.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 20 }),
  profileVisibility: profileVisibilityEnum('profile_visibility'),

  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});
