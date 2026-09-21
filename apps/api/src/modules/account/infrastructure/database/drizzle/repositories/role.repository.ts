import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { RoleRepository } from '@/modules/account/application/admin/ports/role.repository';
import type { AccountRoleName } from '@/modules/account/application/admin/types/account-role-name.type';
import { rolesSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/role.schema';
import { accountRolesSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-role.schema';
import { accountsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/accounts.schema';

@Injectable()
export class DrizzleRoleRepository implements RoleRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async findByName(name: AccountRoleName): Promise<{ id: string; name: AccountRoleName } | null> {
    const [role] = await this.db
      .select({ id: rolesSchema.id, name: rolesSchema.name })
      .from(rolesSchema)
      .where(eq(rolesSchema.name, name))
      .limit(1);

    return role ?? null;
  }

  async replaceUserRole(userId: string, roleId: string | null): Promise<boolean> {
    return await this.db.transaction(async (tx) => {
      const [account] = await tx
        .select({ id: accountsSchema.id })
        .from(accountsSchema)
        .where(eq(accountsSchema.id, userId))
        .for('update');

      if (!account) return false;

      await tx.delete(accountRolesSchema).where(eq(accountRolesSchema.userId, userId));

      if (roleId) {
        await tx.insert(accountRolesSchema).values({ userId, roleId });
      }

      return true;
    });
  }

  async findNameByUserId(userId: string): Promise<AccountRoleName | null> {
    const [row] = await this.db
      .select({ name: rolesSchema.name })
      .from(accountRolesSchema)
      .innerJoin(rolesSchema, eq(rolesSchema.id, accountRolesSchema.roleId))
      .where(eq(accountRolesSchema.userId, userId));

    return row?.name ?? null;
  }
}
