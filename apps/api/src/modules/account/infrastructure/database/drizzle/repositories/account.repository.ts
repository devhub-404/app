import { canonicalizeEmailAddress } from '@/modules/account/application/shared/email-address';
import { randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNotNull, lt } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { DrizzleUnitOfWork, type DrizzleTransaction } from '@/shared/infrastructure/database/drizzle/unit-of-work';
import { accountsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/accounts.schema';
import { accountEmailsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-emails.schema';
import { accountProfileSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-profiles.schema';
import { accountPreferencesSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-preferences.schema';
import { DEFAULT_USER_PREFERENCES } from '@/modules/account/application/preferences/preferences.defaults';
import {
  type AccountByEmailRow,
  type AccountPrimaryEmailRow,
  AccountRepository,
  type AccountSecurityRow,
} from '@/modules/account/application/ports/account.repository';
import { deriveAccountStatus } from '@/modules/account/public/account-access.ports';
import { AccountWriteRepository } from '@/modules/account/application/account/ports/account.write.repository';
import { Account } from '@/modules/account/domain/entities/account';

@Injectable()
export class DrizzleAccountRepository implements AccountRepository, AccountWriteRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    private readonly unitOfWork: DrizzleUnitOfWork,
  ) {}

  async findAggregateById(accountId: string): Promise<Account | null> {
    const [row] = await this.db.select().from(accountsSchema).where(eq(accountsSchema.id, accountId));
    if (!row) return null;

    return Account.rehydrate({
      id: row.id,
      voluntaryStatus: row.voluntaryStatus,
      moderationStatus: row.moderationStatus,
      deletionStatus: row.deletionStatus,
      deletionRequestedAt: row.deletionRequestedAt,
      lockedUntil: row.lockedUntil,
    });
  }

  async saveAggregate(account: Account): Promise<boolean> {
    const [row] = await this.db
      .update(accountsSchema)
      .set({
        voluntaryStatus: account.voluntaryStatus,
        moderationStatus: account.moderationStatus,
        deletionStatus: account.deletionStatus,
        deletionRequestedAt: account.deletionRequestedAt,
        lockedUntil: account.lockedUntil,
        updatedAt: new Date(),
      })
      .where(eq(accountsSchema.id, account.id))
      .returning({ id: accountsSchema.id });

    return Boolean(row);
  }

  async create(input: { email?: string | null; emailVerifiedAt?: Date | null }): Promise<string> {
    const active = this.unitOfWork.current;
    if (active) return this.createIn(active, input);

    return this.db.$primary.transaction(async (tx) => this.createIn(tx, input));
  }

  private async createIn(
    tx: DrizzleTransaction,
    input: { email?: string | null; emailVerifiedAt?: Date | null },
  ): Promise<string> {
    const [row] = await tx.insert(accountsSchema).values({}).returning({ id: accountsSchema.id });
    if (!row) throw new Error('IDENTITY_CREATE_FAILED');

    const username = `user_${randomBytes(8).toString('hex')}`;
    await tx.insert(accountProfileSchema).values({ userId: row.id, username });
    await tx.insert(accountPreferencesSchema).values({
      userId: row.id,
      ...DEFAULT_USER_PREFERENCES,
    });

    if (input.email) {
      await tx.insert(accountEmailsSchema).values({
        userId: row.id,
        email: canonicalizeEmailAddress(input.email),
        type: 'primary',
        verifiedAt: input.emailVerifiedAt ?? null,
      });
    }

    return row.id;
  }

  async setMfaEnabled(userId: string, enabled: boolean): Promise<boolean> {
    const [row] = await this.db
      .update(accountsSchema)
      .set({
        mfaEnabled: enabled,
        updatedAt: new Date(),
      })
      .where(eq(accountsSchema.id, userId))
      .returning({ id: accountsSchema.id });

    return Boolean(row);
  }

  async setLockedUntil(userId: string, lockedUntil: Date | null): Promise<void> {
    await this.db
      .update(accountsSchema)
      .set({
        lockedUntil,
        updatedAt: new Date(),
      })
      .where(eq(accountsSchema.id, userId));
  }

  async findByEmail(email: string): Promise<AccountByEmailRow | null> {
    const db = this.unitOfWork.current ?? this.db.$primary;
    const [row] = await db
      .select({
        userId: accountEmailsSchema.userId,
        email: accountEmailsSchema.email,
        verifiedAt: accountEmailsSchema.verifiedAt,
      })
      .from(accountEmailsSchema)
      .where(eq(accountEmailsSchema.email, canonicalizeEmailAddress(email)));

    return row ?? null;
  }

  async findById(userId: string): Promise<AccountSecurityRow | null> {
    const [row] = await this.db.select().from(accountsSchema).where(eq(accountsSchema.id, userId));
    if (!row) return null;

    return {
      ...row,
      status: deriveAccountStatus(row),
      deletedAt: row.deletionStatus === 'pending' ? row.deletionRequestedAt : null,
    };
  }

  async findPrimaryEmailByUserId(userId: string): Promise<AccountPrimaryEmailRow | null> {
    const [row] = await this.db
      .select({ email: accountEmailsSchema.email, verifiedAt: accountEmailsSchema.verifiedAt })
      .from(accountEmailsSchema)
      .where(and(eq(accountEmailsSchema.userId, userId), eq(accountEmailsSchema.type, 'primary')));

    return row ?? null;
  }

  async deleteById(userId: string): Promise<void> {
    await this.db.delete(accountsSchema).where(eq(accountsSchema.id, userId));
  }

  async listDeletionPurgeCandidateIds(cutoff: Date): Promise<string[]> {
    const rows = await this.db
      .select({ id: accountsSchema.id })
      .from(accountsSchema)
      .where(
        and(
          eq(accountsSchema.deletionStatus, 'pending'),
          isNotNull(accountsSchema.deletionRequestedAt),
          lt(accountsSchema.deletionRequestedAt, cutoff),
        ),
      );

    return rows.map((row) => row.id);
  }
}
