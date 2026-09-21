import { eq, sql } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { accountPreferencesSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-preferences.schema';
import { PreferencesQueryRepository } from '@/modules/account/application/preferences/ports/preferences.query.repository';
import { DEFAULT_USER_PREFERENCES } from '@/modules/account/application/preferences/preferences.defaults';
import { AccountPreferencesDTO, type Locale } from '@/modules/account/application/preferences/dtos/out';

@Injectable()
export class DrizzlePreferencesQueryRepository implements PreferencesQueryRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async findByUserId(userId: string): Promise<AccountPreferencesDTO | null> {
    const [row] = await this.db
      .select({
        userId: accountPreferencesSchema.userId,
        locale: accountPreferencesSchema.locale,
        profileVisibility: sql<
          'public' | 'private'
        >`coalesce(${accountPreferencesSchema.profileVisibility}, ${DEFAULT_USER_PREFERENCES.profileVisibility})`,
      })
      .from(accountPreferencesSchema)
      .where(eq(accountPreferencesSchema.userId, userId))
      .limit(1);

    if (!row) {
      return {
        userId,
        locale: DEFAULT_USER_PREFERENCES.locale,
        profileVisibility: DEFAULT_USER_PREFERENCES.profileVisibility,
      };
    }

    return {
      userId: row.userId,
      locale: row.locale as Locale | null,
      profileVisibility: row.profileVisibility,
    };
  }
}
