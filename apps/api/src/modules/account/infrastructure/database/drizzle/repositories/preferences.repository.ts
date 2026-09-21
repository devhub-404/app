import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { accountPreferencesSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-preferences.schema';
import { PreferencesRepository } from '@/modules/account/application/preferences/ports/preferences.repository';
import { UpdateAccountPreferencesDTO } from '@/modules/account/application/preferences/dtos/in';
import { DEFAULT_USER_PREFERENCES } from '@/modules/account/application/preferences/preferences.defaults';

@Injectable()
export class DrizzlePreferencesRepository implements PreferencesRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async update(userId: string, patch: UpdateAccountPreferencesDTO): Promise<boolean> {
    const set = pickDefined({
      locale: patch.locale,
      profileVisibility: patch.profileVisibility,
      updatedAt: new Date(),
    });

    const [row] = await this.db
      .update(accountPreferencesSchema)
      .set(set)
      .where(eq(accountPreferencesSchema.userId, userId))
      .returning({ userId: accountPreferencesSchema.userId });

    return Boolean(row);
  }

  async createDefault(userId: string): Promise<void> {
    await this.db.insert(accountPreferencesSchema).values({
      userId,
      ...DEFAULT_USER_PREFERENCES,
    });
  }
}

function pickDefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      (out as Record<string, unknown>)[key] = value;
    }
  }

  return out;
}
