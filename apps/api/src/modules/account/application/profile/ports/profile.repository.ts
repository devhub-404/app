import type { Profile } from '@/modules/account/domain/entities/profile';

export abstract class ProfileRepository {
  abstract findById(userId: string): Promise<Profile | null>;
  abstract create(profile: Profile): Promise<void>;
  abstract save(profile: Profile): Promise<void>;
  abstract createDefault(userId: string, username: string): Promise<void>;
}
