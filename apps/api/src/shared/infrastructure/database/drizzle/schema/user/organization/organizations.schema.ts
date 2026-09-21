import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { accountsSchema } from '../account/accounts.schema';

export const organizationTypeEnum = pgEnum('organization_type', [
  'company',
  'community',
  'open_source',
  'foundation',
  'group',
  'institution',
  'other',
]);
export const organizationStatusEnum = pgEnum('organization_status', ['active', 'archived']);
export const organizationMembershipRoleEnum = pgEnum('organization_membership_role', ['owner', 'admin', 'member']);

export const organizationsSchema = pgTable(
  'organizations',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    name: varchar('name', { length: 160 }).notNull(),
    slug: varchar('slug', { length: 180 }).notNull(),
    type: organizationTypeEnum('type').notNull(),
    description: text('description').notNull(),
    websiteUrl: varchar('website_url', { length: 2048 }),
    avatarUrl: varchar('avatar_url', { length: 2048 }),
    createdByAccountId: uuid('created_by_account_id')
      .notNull()
      .references(() => accountsSchema.id, { onDelete: 'restrict' }),
    status: organizationStatusEnum('status').notNull().default('active'),
    deletedAt: timestamp('deleted_at', { mode: 'string', withTimezone: true }),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('organizations_slug_unique_idx').on(t.slug),
    index('organizations_status_name_idx').on(t.status, t.name),
    index('organizations_deleted_at_idx').on(t.deletedAt),
  ],
);

export const organizationMembershipsSchema = pgTable(
  'organization_memberships',
  {
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationsSchema.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accountsSchema.id, { onDelete: 'cascade' }),
    role: organizationMembershipRoleEnum('role').notNull().default('member'),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.organizationId, t.accountId] }),
    index('organization_memberships_account_idx').on(t.accountId, t.role),
    index('organization_memberships_org_role_idx').on(t.organizationId, t.role),
  ],
);
