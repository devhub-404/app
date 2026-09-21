import { and, eq, inArray, isNull, ne, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { ProfileDTO } from '@/modules/account/application/profile/dtos/out';
import {
  ProfileQueryRepository,
  type ProfileDiscoveryFilters,
} from '@/modules/account/application/profile/ports/profile.query.repository';
import { accountProfileSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-profiles.schema';
import { accountsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/accounts.schema';
import { accountPreferencesSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-preferences.schema';
import { MEDIA_CONFIG, type MediaConfig } from '@/modules/media/public/media-config.port';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { mediaObjectsSchema } from '@/shared/infrastructure/database/drizzle/schema/media/media-objects.schema';

type DbSocialLinks = { githubUrl?: string | null; linkedinUrl?: string | null; twitterUrl?: string | null } | null;
type ProfileRow = {
  userId: string;
  username: string;
  displayName: string | null;
  avatarObjectKey: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  portfolioUrl: string | null;
  socialLinks: DbSocialLinks;
};

@Injectable()
export class DrizzleProfileQueryRepository implements ProfileQueryRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    @Inject(MEDIA_CONFIG) private readonly mediaConfig: MediaConfig,
  ) {}

  async findByUserId(userId: string, filters: ProfileDiscoveryFilters = {}): Promise<ProfileDTO | null> {
    const [row] = await this.baseSelect().where(
      and(
        eq(accountProfileSchema.userId, userId),
        eq(accountsSchema.deletionStatus, 'none'),
        ...buildVisibilityConditions(filters),
      ),
    );

    return row ? mapProfileView(row, this.mediaConfig) : null;
  }

  async findByUserIds(userIds: string[], filters: ProfileDiscoveryFilters = {}): Promise<ProfileDTO[]> {
    const ids = [...new Set(userIds.filter(Boolean))];
    if (ids.length === 0) return [];
    const rows = await this.baseSelect().where(
      and(
        inArray(accountProfileSchema.userId, ids),
        eq(accountsSchema.deletionStatus, 'none'),
        ...buildVisibilityConditions(filters),
      ),
    );

    return rows.map((row) => mapProfileView(row, this.mediaConfig));
  }

  async findByUsername(username: string, filters: ProfileDiscoveryFilters = {}): Promise<ProfileDTO | null> {
    const [row] = await this.baseSelect().where(
      and(
        eq(accountProfileSchema.username, username),
        eq(accountsSchema.deletionStatus, 'none'),
        ...buildVisibilityConditions(filters),
      ),
    );

    return row ? mapProfileView(row, this.mediaConfig) : null;
  }

  async existsByUsername(username: string, excludedUserId?: string): Promise<boolean> {
    const conditions = [eq(accountProfileSchema.username, username), eq(accountsSchema.deletionStatus, 'none')];
    if (excludedUserId) conditions.push(ne(accountProfileSchema.userId, excludedUserId));

    const [row] = await this.db
      .select({ userId: accountProfileSchema.userId })
      .from(accountProfileSchema)
      .innerJoin(accountsSchema, eq(accountsSchema.id, accountProfileSchema.userId))
      .where(and(...conditions.filter((condition) => condition !== undefined)));

    return Boolean(row);
  }

  private baseSelect() {
    const avatarMedia = alias(mediaObjectsSchema, 'profile_avatar_media');

    return this.db
      .select({
        userId: accountProfileSchema.userId,
        username: accountProfileSchema.username,
        displayName: accountProfileSchema.displayName,
        avatarObjectKey: avatarMedia.objectKey,
        headline: accountProfileSchema.headline,
        bio: accountProfileSchema.bio,
        location: accountProfileSchema.location,
        portfolioUrl: accountProfileSchema.portfolioUrl,
        socialLinks: accountProfileSchema.socialLinks,
      })
      .from(accountProfileSchema)
      .innerJoin(accountsSchema, eq(accountsSchema.id, accountProfileSchema.userId))
      .leftJoin(accountPreferencesSchema, eq(accountPreferencesSchema.userId, accountProfileSchema.userId))
      .leftJoin(
        avatarMedia,
        and(eq(avatarMedia.id, accountProfileSchema.avatarMediaId), eq(avatarMedia.status, 'confirmed')),
      );
  }
}

function buildVisibilityConditions(filters: ProfileDiscoveryFilters): Array<ReturnType<typeof eq>> {
  const conditions: Array<ReturnType<typeof eq>> = [];
  if (filters.visibility !== undefined) {
    conditions.push(
      filters.visibility === 'public'
        ? or(
            eq(accountPreferencesSchema.profileVisibility, 'public'),
            isNull(accountPreferencesSchema.profileVisibility),
          )!
        : eq(accountPreferencesSchema.profileVisibility, filters.visibility),
    );
  }

  return conditions;
}

function mapProfileView(row: ProfileRow, config: MediaConfig): ProfileDTO {
  const links = row.socialLinks ?? {};

  return {
    userId: row.userId,
    username: row.username,
    displayName: row.displayName,
    avatarUrl: resolvePublicUrl(row.avatarObjectKey, config),
    headline: row.headline,
    bio: row.bio,
    location: row.location,
    portfolioUrl: row.portfolioUrl,
    githubUrl: links.githubUrl ?? null,
    linkedinUrl: links.linkedinUrl ?? null,
    twitterUrl: links.twitterUrl ?? null,
  };
}

function resolvePublicUrl(objectKey: string | null, config: MediaConfig): string | null {
  if (!objectKey) return null;
  const publicBaseUrl = config.storage.publicBaseUrl;

  return publicBaseUrl ? new URL(objectKey, publicBaseUrl).toString() : null;
}
