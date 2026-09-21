import { computed } from 'nanostores';
import { $account } from '@/features/account/public/account-state';

export type AuthSessionState =
  | {
      status: 'unauthenticated' | 'loading';
      me: null;
    }
  | {
      status: 'authenticated';
      me: {
        profile: {
          username: string;
          displayName: string;
          avatarUrl: string;
        };
      };
    };

export const $accountSession = computed($account, (state): AuthSessionState => {
  if (state.status === 'loading') {
    return { status: 'loading', me: null };
  }

  if (state.details || state.shell) {
    const profile = state.details?.profile ?? state.shell?.profile;
    if (!profile) return { status: 'unauthenticated', me: null };
    return {
      status: 'authenticated',
      me: {
        profile: {
          username: profile?.username ?? '',
          displayName: profile?.displayName ?? '',
          avatarUrl: profile?.avatarUrl ?? '',
        },
      },
    };
  }

  return { status: 'unauthenticated', me: null };
});
