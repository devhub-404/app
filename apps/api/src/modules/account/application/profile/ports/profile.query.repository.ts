import { ProfileDTO } from '@/modules/account/application/profile/dtos/out';

export type ProfileDiscoveryFilters = { visibility?: 'public' | 'private' };
export abstract class ProfileQueryRepository {
  abstract findByUserId(userId: string, filters?: ProfileDiscoveryFilters): Promise<ProfileDTO | null>;
  /** Batch read for projection consumers; avoids one query per author. */
  abstract findByUserIds(userIds: string[], filters?: ProfileDiscoveryFilters): Promise<ProfileDTO[]>;
  abstract findByUsername(username: string, filters?: ProfileDiscoveryFilters): Promise<ProfileDTO | null>;
  abstract existsByUsername(username: string, excludedUserId?: string): Promise<boolean>;
}
