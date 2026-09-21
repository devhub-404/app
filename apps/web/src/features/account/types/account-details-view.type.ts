import type { AccountDetailsDTO, AccountShellDTO } from './account.type.ts';

/** Canonical client projection of GET /me/details. Domain-specific auth lists are not embedded here. */
export type AccountDetailsView = AccountDetailsDTO;

/**
 * The account projection required by the global shell. Keep this smaller than
 * AccountDetailsView so the authenticated document does not carry account
 * settings and email addresses into every page.
 */
export type AccountShellView = AccountShellDTO;

export function toAccountShellView(details: AccountDetailsView): AccountShellView {
  return {
    account: {
      id: details.account.id,
      status: details.account.status ?? 'active',
    },
    profile: {
      username: details.profile?.username ?? '',
      displayName: details.profile?.displayName ?? null,
      avatarUrl: details.profile?.avatarUrl ?? null,
    },
    preferences: { locale: details.preferences?.locale ?? null },
    role: details.role,
  };
}
