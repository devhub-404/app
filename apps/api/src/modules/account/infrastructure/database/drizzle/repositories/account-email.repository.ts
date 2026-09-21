import { canonicalizeEmailAddress } from '@/modules/account/application/shared/email-address';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { accountEmailsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-emails.schema';
import {
  type AccountEmailLookupRow,
  type AccountEmailDetails,
  AccountEmailRepository,
} from '@/modules/account/application/ports/account-email.repository';
import { AccountEmailQueryRepository } from '@/modules/account/application/ports/account-email.query.repository';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class DrizzleAccountEmailRepository implements AccountEmailRepository, AccountEmailQueryRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async create(input: { userId: string; email: string; isPrimary: boolean; verifiedAt?: Date | null }): Promise<void> {
    await this.db.insert(accountEmailsSchema).values({
      userId: input.userId,
      email: canonicalizeEmailAddress(input.email),
      type: input.isPrimary ? 'primary' : 'backup',
      verifiedAt: input.verifiedAt ?? null,
    });
  }

  async updateEmail(id: string, email: string, verifiedAt: Date | null): Promise<void> {
    await this.db
      .update(accountEmailsSchema)
      .set({ email: canonicalizeEmailAddress(email), verifiedAt, updatedAt: new Date() })
      .where(eq(accountEmailsSchema.id, id));
  }

  async setVerifiedAt(userId: string, email: string, verifiedAt: Date): Promise<void> {
    await this.db
      .update(accountEmailsSchema)
      .set({ verifiedAt })
      .where(
        and(eq(accountEmailsSchema.userId, userId), eq(accountEmailsSchema.email, canonicalizeEmailAddress(email))),
      );
  }

  async upsertPrimary(input: { userId: string; email: string; verifiedAt: Date }): Promise<void> {
    const [existing] = await this.db
      .select({ id: accountEmailsSchema.id })
      .from(accountEmailsSchema)
      .where(and(eq(accountEmailsSchema.userId, input.userId), eq(accountEmailsSchema.type, 'primary')));

    if (existing) {
      await this.db
        .update(accountEmailsSchema)
        .set({ email: canonicalizeEmailAddress(input.email), verifiedAt: input.verifiedAt, updatedAt: new Date() })
        .where(eq(accountEmailsSchema.id, existing.id));
    } else {
      await this.db.insert(accountEmailsSchema).values({
        userId: input.userId,
        email: canonicalizeEmailAddress(input.email),
        type: 'primary',
        verifiedAt: input.verifiedAt,
      });
    }
  }

  async upsertBackup(input: { userId: string; email: string; verifiedAt: Date }): Promise<void> {
    const [existing] = await this.db
      .select({ id: accountEmailsSchema.id })
      .from(accountEmailsSchema)
      .where(and(eq(accountEmailsSchema.userId, input.userId), eq(accountEmailsSchema.type, 'backup')));

    if (existing) {
      await this.db
        .update(accountEmailsSchema)
        .set({ email: canonicalizeEmailAddress(input.email), verifiedAt: input.verifiedAt, updatedAt: new Date() })
        .where(eq(accountEmailsSchema.id, existing.id));
    } else {
      await this.db.insert(accountEmailsSchema).values({
        userId: input.userId,
        email: canonicalizeEmailAddress(input.email),
        type: 'backup',
        verifiedAt: input.verifiedAt,
      });
    }
  }

  async deleteBackupByUserId(userId: string): Promise<void> {
    await this.db
      .delete(accountEmailsSchema)
      .where(and(eq(accountEmailsSchema.userId, userId), eq(accountEmailsSchema.type, 'backup')));
  }

  async findByEmail(email: string): Promise<AccountEmailLookupRow | null> {
    const [row] = await this.db
      .select({
        userId: accountEmailsSchema.userId,
        email: accountEmailsSchema.email,
        type: accountEmailsSchema.type,
        verifiedAt: accountEmailsSchema.verifiedAt,
      })
      .from(accountEmailsSchema)
      .where(eq(accountEmailsSchema.email, canonicalizeEmailAddress(email)));

    return row ?? null;
  }

  async findPrimaryByUserId(userId: string): Promise<{ id: string; email: string } | null> {
    const [row] = await this.db
      .select({
        id: accountEmailsSchema.id,
        email: accountEmailsSchema.email,
      })
      .from(accountEmailsSchema)
      .where(and(eq(accountEmailsSchema.userId, userId), eq(accountEmailsSchema.type, 'primary')));

    return row ?? null;
  }

  async findBackupByUserId(userId: string): Promise<{ id: string; email: string } | null> {
    const [row] = await this.db
      .select({
        id: accountEmailsSchema.id,
        email: accountEmailsSchema.email,
      })
      .from(accountEmailsSchema)
      .where(and(eq(accountEmailsSchema.userId, userId), eq(accountEmailsSchema.type, 'backup')));

    return row ?? null;
  }

  async listByUserId(userId: string): Promise<AccountEmailDetails[]> {
    return this.db
      .select({
        id: accountEmailsSchema.id,
        userId: accountEmailsSchema.userId,
        email: accountEmailsSchema.email,
        type: accountEmailsSchema.type,
        verifiedAt: accountEmailsSchema.verifiedAt,
        createdAt: accountEmailsSchema.createdAt,
      })
      .from(accountEmailsSchema)
      .where(eq(accountEmailsSchema.userId, userId));
  }
}
