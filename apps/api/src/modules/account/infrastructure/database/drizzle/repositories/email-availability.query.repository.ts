import { canonicalizeEmailAddress } from '@/modules/account/application/shared/email-address';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { accountEmailsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-emails.schema';
import { EmailAvailabilityQueryRepository } from '@/modules/account/application/account/ports/email-availability.query.repository';

@Injectable()
export class DrizzleEmailAvailabilityQueryRepository implements EmailAvailabilityQueryRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async isEmailAvailable(email: string): Promise<boolean> {
    const row = await this.db
      .select({ id: accountEmailsSchema.id })
      .from(accountEmailsSchema)
      .where(eq(accountEmailsSchema.email, canonicalizeEmailAddress(email)))
      .limit(1)
      .then((rows) => rows[0] ?? null);

    return row === null;
  }
}
