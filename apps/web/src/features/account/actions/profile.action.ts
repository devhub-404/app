import { ProfileApi } from '@/features/account/api/profile.api.ts';
import type { UpdateProfileDTO } from '@/features/account/types/profile.type.ts';
import { $account, setAccountDetails } from '@/features/account/store/account.store';
import type { ApiClient } from '@/shared/api';

export async function updateMyProfile(payload: UpdateProfileDTO) {
  const result = await ProfileApi.updateMyProfile(payload);
  if (result.error) return false;

  const current = $account.get();
  if (current.details?.profile) {
    const returned = result.data?.data;
    const nextProfile = returned ?? {
      ...current.details.profile,
      ...payload,
    };
    setAccountDetails({ ...current.details, profile: nextProfile });
  }
  return true;
}
export async function getProfileByUsername(username: string, client?: ApiClient) {
  const { data, error } = await ProfileApi.getByUsername(username, client);
  if (error) return null;
  return data?.data ?? null;
}
