import type { Locale, ProfileVisibility } from '@/modules/account/application/preferences/dtos/out';

export const DEFAULT_USER_PREFERENCES = {
  locale: null as Locale | null,
  profileVisibility: 'public' as ProfileVisibility,
};
