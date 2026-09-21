import type { ProfileDTO, PublicProfileDTO, UpdateProfileDTO } from '@/features/account/types/profile.type.ts';
import { privateClient } from '@/shared/api';
import { publicClient, type ApiClient } from '@/shared/api';
import type { ApiResult } from '@/shared/api';

export class ProfileApi {
  static async updateMyProfile(payload: UpdateProfileDTO): Promise<ApiResult<ProfileDTO>> {
    return privateClient.PATCH('/api/v1/profiles/me', { body: payload });
  }
  static async getByUsername(username: string, client: ApiClient = publicClient): Promise<ApiResult<PublicProfileDTO>> {
    return client.GET('/api/v1/profiles/{username}', {
      params: { path: { username } },
    });
  }
}
