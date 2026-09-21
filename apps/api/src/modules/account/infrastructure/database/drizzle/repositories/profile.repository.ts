import { eq } from 'drizzle-orm';
import { ProfileRepository } from '@/modules/account/application/profile/ports/profile.repository';
import { Profile } from '@/modules/account/domain/entities/profile';
import { accountProfileSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-profiles.schema';
import { ProfilesMapper } from '@/modules/account/infrastructure/database/drizzle/profile/profiles.mapper';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';

@Injectable()
export class DrizzleProfileRepository implements ProfileRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async findById(userId: string): Promise<Profile | null> {
    const [row] = await this.db.select().from(accountProfileSchema).where(eq(accountProfileSchema.userId, userId));

    if (!row) return null;

    return ProfilesMapper.toEntity(row);
  }

  async create(profile: Profile): Promise<void> {
    const [row] = await this.db
      .insert(accountProfileSchema)
      .values(ProfilesMapper.toPersistance(profile))
      .returning({ userId: accountProfileSchema.userId });

    if (!row) throw new Error('User profile not found after creation.');
  }

  async save(profile: Profile): Promise<void> {
    const values = ProfilesMapper.toPersistance(profile);
    const [row] = await this.db
      .update(accountProfileSchema)
      .set(values)
      .where(eq(accountProfileSchema.userId, profile.userId))
      .returning({ userId: accountProfileSchema.userId });

    if (!row) throw new Error('User profile not found for update.');
  }

  async createDefault(userId: string, username: string): Promise<void> {
    await this.db.insert(accountProfileSchema).values({ userId, username });
  }
}
