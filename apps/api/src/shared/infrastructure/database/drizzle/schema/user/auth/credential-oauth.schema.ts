import { pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { credentialSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential.schema';

export const credentialOAuthSchema = pgTable(
  'credential_oauth',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => credentialSchema.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 50 }).$type<'github' | 'google'>().notNull(),
    providerUserId: varchar('provider_user_id', { length: 255 }).notNull(),
  },
  (table) => ({
    providerProviderUserIdIdx: uniqueIndex('credential_oauth_provider_provider_user_id_idx').on(
      table.provider,
      table.providerUserId,
    ),
  }),
);
