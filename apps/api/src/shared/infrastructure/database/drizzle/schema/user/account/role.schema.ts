import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, uuid } from 'drizzle-orm/pg-core';

export const roleNameEnum = pgEnum('role_name', ['curator', 'admin', 'moderator']);

export const rolesSchema = pgTable('roles', {
  id: uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`),
  name: roleNameEnum('name').notNull().unique(),
});
