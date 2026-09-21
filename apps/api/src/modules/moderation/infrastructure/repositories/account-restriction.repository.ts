import { and, eq, gt, isNull, lte, or } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { accountRestrictionsSchema } from '@/shared/infrastructure/database/drizzle/schema/moderation/account-restrictions.schema';
import {
  AccountRestrictionPort,
  type AccountRestrictionRow,
} from '@/modules/moderation/application/ports/account-restriction.port';
import type { RestrictionCapability } from '@/modules/moderation/public/account-restriction.port';

function map(row: typeof accountRestrictionsSchema.$inferSelect): AccountRestrictionRow {
  return {
    id: row.id,
    accountId: row.accountId,
    capability: row.capability,
    reason: row.reason,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    appliedByAccountId: row.appliedByAccountId,
    revokedAt: row.revokedAt,
    revokedByAccountId: row.revokedByAccountId,
    revokeReason: row.revokeReason,
    createdAt: row.createdAt,
  };
}

@Injectable()
export class DrizzleAccountRestrictionRepository implements AccountRestrictionPort {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async deleteByAccountId(accountId: string): Promise<number> {
    const rows = await this.db
      .delete(accountRestrictionsSchema)
      .where(eq(accountRestrictionsSchema.accountId, accountId))
      .returning({ id: accountRestrictionsSchema.id });

    return rows.length;
  }

  async list(accountId: string): Promise<AccountRestrictionRow[]> {
    const rows = await this.db
      .select()
      .from(accountRestrictionsSchema)
      .where(eq(accountRestrictionsSchema.accountId, accountId));

    return rows.map(map);
  }

  async findEffective(
    accountId: string,
    capability: RestrictionCapability,
    now: string,
  ): Promise<AccountRestrictionRow | null> {
    const [row] = await this.db
      .select()
      .from(accountRestrictionsSchema)
      .where(
        and(
          eq(accountRestrictionsSchema.accountId, accountId),
          eq(accountRestrictionsSchema.capability, capability),
          isNull(accountRestrictionsSchema.revokedAt),
          lte(accountRestrictionsSchema.startsAt, now),
          or(isNull(accountRestrictionsSchema.endsAt), gt(accountRestrictionsSchema.endsAt, now)),
        ),
      )
      .limit(1);

    return row ? map(row) : null;
  }

  async create(
    input: Omit<AccountRestrictionRow, 'id' | 'revokedAt' | 'revokedByAccountId' | 'revokeReason' | 'createdAt'>,
  ): Promise<AccountRestrictionRow> {
    const [row] = await this.db.insert(accountRestrictionsSchema).values(input).returning();
    if (!row) throw new Error('ACCOUNT_RESTRICTION_CREATE_FAILED');

    return map(row);
  }

  async revoke(input: {
    accountId: string;
    restrictionId: string;
    revokedByAccountId: string;
    reason: string;
    revokedAt: string;
  }): Promise<AccountRestrictionRow | null> {
    const [row] = await this.db
      .update(accountRestrictionsSchema)
      .set({
        revokedAt: input.revokedAt,
        revokedByAccountId: input.revokedByAccountId,
        revokeReason: input.reason,
      })
      .where(
        and(
          eq(accountRestrictionsSchema.id, input.restrictionId),
          eq(accountRestrictionsSchema.accountId, input.accountId),
          isNull(accountRestrictionsSchema.revokedAt),
        ),
      )
      .returning();

    return row ? map(row) : null;
  }
}
