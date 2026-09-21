import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import {
  type AccountListResult,
  AccountListQueryRepository,
} from '@/modules/account/application/admin/ports/account-list.query.repository';
import { accountsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/accounts.schema';
import { accountEmailsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-emails.schema';
import { accountProfileSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-profiles.schema';
import { accountRolesSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-role.schema';
import { rolesSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/role.schema';
import { deriveAccountStatus } from '@/modules/account/public/account-access.ports';
import type { AccountRoleName } from '@/modules/account/application/admin/types/account-role-name.type';

@Injectable()
export class DrizzleAccountListQueryRepository implements AccountListQueryRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}
  async list(offset: number, limit: number): Promise<AccountListResult> {
    const data = await this.db
      .select({
        id: accountsSchema.id,
        voluntaryStatus: accountsSchema.voluntaryStatus,
        moderationStatus: accountsSchema.moderationStatus,
        deletionStatus: accountsSchema.deletionStatus,
        deletionRequestedAt: accountsSchema.deletionRequestedAt,
        mfaEnabled: accountsSchema.mfaEnabled,
        lockedUntil: accountsSchema.lockedUntil,
        email: accountEmailsSchema.email,
        username: accountProfileSchema.username,
        createdAt: accountsSchema.createdAt,
        total: sql<number>`count(*) over()`,
      })
      .from(accountsSchema)
      .leftJoin(
        accountEmailsSchema,
        and(eq(accountEmailsSchema.userId, accountsSchema.id), eq(accountEmailsSchema.type, 'primary')),
      )
      .leftJoin(accountProfileSchema, eq(accountProfileSchema.userId, accountsSchema.id))
      .orderBy(desc(accountsSchema.createdAt))
      .offset(offset)
      .limit(limit);

    return {
      data: await this.withRoles(
        data.map(({ total: _total, ...row }) => ({
          ...row,
          status: deriveAccountStatus(row),
          email: row.email ?? null,
          username: row.username ?? null,
        })),
      ),
      total: Number(data[0]?.total ?? 0),
    };
  }
  async findById(userId: string): Promise<AccountListResult['data'][number] | null> {
    const [row] = await this.db
      .select({
        id: accountsSchema.id,
        voluntaryStatus: accountsSchema.voluntaryStatus,
        moderationStatus: accountsSchema.moderationStatus,
        deletionStatus: accountsSchema.deletionStatus,
        deletionRequestedAt: accountsSchema.deletionRequestedAt,
        mfaEnabled: accountsSchema.mfaEnabled,
        lockedUntil: accountsSchema.lockedUntil,
        email: accountEmailsSchema.email,
        username: accountProfileSchema.username,
        createdAt: accountsSchema.createdAt,
      })
      .from(accountsSchema)
      .leftJoin(
        accountEmailsSchema,
        and(eq(accountEmailsSchema.userId, accountsSchema.id), eq(accountEmailsSchema.type, 'primary')),
      )
      .leftJoin(accountProfileSchema, eq(accountProfileSchema.userId, accountsSchema.id))
      .where(eq(accountsSchema.id, userId));
    if (!row) return null;
    const [account] = await this.withRoles([
      { ...row, status: deriveAccountStatus(row), email: row.email ?? null, username: row.username ?? null },
    ]);

    return account ?? null;
  }
  private async withRoles(
    rows: Array<Omit<AccountListResult['data'][number], 'role'>>,
  ): Promise<AccountListResult['data']> {
    if (!rows.length) return [];
    const roleRows = await this.db
      .select({ userId: accountRolesSchema.userId, name: rolesSchema.name })
      .from(accountRolesSchema)
      .innerJoin(rolesSchema, eq(rolesSchema.id, accountRolesSchema.roleId))
      .where(
        inArray(
          accountRolesSchema.userId,
          rows.map((row) => row.id),
        ),
      );
    const roleByUser = new Map<string, AccountRoleName>();
    for (const role of roleRows) {
      roleByUser.set(role.userId, role.name);
    }

    return rows.map((row) => ({ ...row, role: roleByUser.get(row.id) ?? null }));
  }
}
