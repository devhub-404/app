import { computed } from 'nanostores';
import { $account } from '@/features/account/public/account-state';

/** Roles are a server-derived projection, never decoded from a client token. */
export const $authRole = computed($account, (state) => state.details?.role ?? state.shell?.role ?? null);
