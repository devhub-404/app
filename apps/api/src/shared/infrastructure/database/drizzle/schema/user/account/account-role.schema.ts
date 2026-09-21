import { index, pgTable, primaryKey, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { accountsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/accounts.schema';
import { rolesSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/role.schema';

export const accountRolesSchema = pgTable(
  'account_roles',
  {
    userId: uuid('user_id')
      .references(() => accountsSchema.id, { onDelete: 'cascade' })
      .notNull(),
    roleId: uuid('role_id')
      .references(() => rolesSchema.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.roleId] }),
    index('account_roles_role_idx').on(table.roleId, table.userId),
    uniqueIndex('account_roles_user_unique').on(table.userId),
  ],
);
