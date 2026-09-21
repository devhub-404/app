import { canonicalizeEmailAddress } from '@/modules/account/application/shared/email-address';
import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { AccountAuthenticationQueryRepository } from '@/modules/account/application/account/ports/account-authentication.query.repository';
import type {
  AccountAuthenticationViewResult,
  VerifiedPrimaryEmailAccountResult,
} from '@/modules/account/application/account/ports/account-authentication.query.repository';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { accountsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/accounts.schema';
import { accountEmailsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-emails.schema';
import { accountRolesSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-role.schema';
import { rolesSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/role.schema';
import { deriveAccountStatus } from '@/modules/account/public/account-access.ports';
import { Role } from '@/shared/kernel/auth/role';

@Injectable()
export class DrizzleAccountAuthenticationQueryRepository implements AccountAuthenticationQueryRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async getAuthenticationView(userId: string): Promise<AccountAuthenticationViewResult | null> {
    const [userRow] = await this.db
      .select({
        id: accountsSchema.id,
        voluntaryStatus: accountsSchema.voluntaryStatus,
        moderationStatus: accountsSchema.moderationStatus,
        deletionStatus: accountsSchema.deletionStatus,
        deletionRequestedAt: accountsSchema.deletionRequestedAt,
        mfaEnabled: accountsSchema.mfaEnabled,
        lockedUntil: accountsSchema.lockedUntil,
      })
      .from(accountsSchema)
      .where(eq(accountsSchema.id, userId))
      .limit(1);
    if (!userRow) return null;

    const [emailRows, roleRows] = await Promise.all([
      this.db
        .select({ type: accountEmailsSchema.type, verifiedAt: accountEmailsSchema.verifiedAt })
        .from(accountEmailsSchema)
        .where(eq(accountEmailsSchema.userId, userId)),
      this.db
        .select({ role: rolesSchema.name })
        .from(accountRolesSchema)
        .innerJoin(rolesSchema, eq(rolesSchema.id, accountRolesSchema.roleId))
        .where(eq(accountRolesSchema.userId, userId)),
    ]);

    return {
      userId: userRow.id,
      voluntaryStatus: userRow.voluntaryStatus,
      moderationStatus: userRow.moderationStatus,
      deletionStatus: userRow.deletionStatus,
      deletionRequestedAt: userRow.deletionRequestedAt,
      status: deriveAccountStatus(userRow),
      mfaEnabled: userRow.mfaEnabled,
      lockedUntil: userRow.lockedUntil,
      deletedAt: userRow.deletionStatus === 'pending' ? userRow.deletionRequestedAt : null,
      primaryEmailVerified: emailRows.some((row) => row.type === 'primary' && row.verifiedAt !== null),
      backupEmailVerified: emailRows.some((row) => row.type === 'backup' && row.verifiedAt !== null),
      role: (roleRows[0]?.role as Role | undefined) ?? null,
    };
  }

  async getAccessEligibility(userId: string) {
    const [userRow] = await this.db
      .select({
        id: accountsSchema.id,
        voluntaryStatus: accountsSchema.voluntaryStatus,
        moderationStatus: accountsSchema.moderationStatus,
        deletionStatus: accountsSchema.deletionStatus,
        lockedUntil: accountsSchema.lockedUntil,
      })
      .from(accountsSchema)
      .where(eq(accountsSchema.id, userId))
      .limit(1);
    if (!userRow) return null;

    const [primaryEmail] = await this.db
      .select({ verifiedAt: accountEmailsSchema.verifiedAt })
      .from(accountEmailsSchema)
      .where(and(eq(accountEmailsSchema.userId, userId), eq(accountEmailsSchema.type, 'primary')))
      .limit(1);

    return {
      userId: userRow.id,
      voluntaryStatus: userRow.voluntaryStatus,
      moderationStatus: userRow.moderationStatus,
      deletionStatus: userRow.deletionStatus,
      lockedUntil: userRow.lockedUntil,
      primaryEmailVerified: primaryEmail?.verifiedAt != null,
    };
  }

  async findVerifiedPrimaryEmailAccount(email: string): Promise<VerifiedPrimaryEmailAccountResult | null> {
    const [row] = await this.db
      .select({
        userId: accountEmailsSchema.userId,
        email: accountEmailsSchema.email,
        verifiedAt: accountEmailsSchema.verifiedAt,
      })
      .from(accountEmailsSchema)
      .innerJoin(accountsSchema, eq(accountsSchema.id, accountEmailsSchema.userId))
      .where(
        and(eq(accountEmailsSchema.email, canonicalizeEmailAddress(email)), eq(accountEmailsSchema.type, 'primary')),
      )
      .limit(1);

    return row?.verifiedAt ? { userId: row.userId, email: row.email } : null;
  }
}
