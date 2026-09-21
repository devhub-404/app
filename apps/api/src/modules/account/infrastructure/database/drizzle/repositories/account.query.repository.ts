import { canonicalizeEmailAddress } from '@/modules/account/application/shared/email-address';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { eq, and } from 'drizzle-orm';
import { AccountQueryRepository } from '@/modules/account/application/ports/account.query.repository';
import { accountsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/accounts.schema';
import { accountEmailsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-emails.schema';
import { deriveAccountStatus } from '@/modules/account/public/account-access.ports';

@Injectable()
export class DrizzleAccountQueryRepository implements AccountQueryRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async findByEmail(email: string) {
    const [row] = await this.db
      .select({
        userId: accountEmailsSchema.userId,
        email: accountEmailsSchema.email,
        verifiedAt: accountEmailsSchema.verifiedAt,
      })
      .from(accountEmailsSchema)
      .where(eq(accountEmailsSchema.email, canonicalizeEmailAddress(email)));

    return row ?? null;
  }

  async findById(userId: string) {
    const [row] = await this.db.select().from(accountsSchema).where(eq(accountsSchema.id, userId));
    if (!row) return null;

    return {
      ...row,
      status: deriveAccountStatus(row),
      deletedAt: row.deletionStatus === 'pending' ? row.deletionRequestedAt : null,
    };
  }

  async findPrimaryEmailByUserId(userId: string) {
    const [row] = await this.db
      .select({ email: accountEmailsSchema.email, verifiedAt: accountEmailsSchema.verifiedAt })
      .from(accountEmailsSchema)
      .where(and(eq(accountEmailsSchema.userId, userId), eq(accountEmailsSchema.type, 'primary')));

    return row ?? null;
  }
}
