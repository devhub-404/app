import { Profile } from '@/modules/account/domain/entities/profile';
import { accountProfileSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-profiles.schema';

type ProfileRow = typeof accountProfileSchema.$inferSelect;
type ProfileInsert = typeof accountProfileSchema.$inferInsert;

export const ProfilesMapper = {
  toEntity(row: ProfileRow): Profile {
    return Profile.rehydrate({
      userId: row.userId,
      username: row.username,
      displayName: row.displayName ?? null,
      avatarUrl: null,
      avatarMediaId: row.avatarMediaId ?? null,
      headline: row.headline ?? null,
      bio: row.bio ?? null,
      location: row.location ?? null,
      portfolioUrl: row.portfolioUrl ?? null,
      socialLinks: row.socialLinks ?? null,
    });
  },
  toPersistance(profile: Profile): ProfileInsert {
    return {
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      avatarMediaId: profile.avatarMediaId,
      headline: profile.headline,
      bio: profile.bio,
      location: profile.location,
      portfolioUrl: profile.portfolioUrl,
      socialLinks: profile.socialLinks,
    };
  },
};
