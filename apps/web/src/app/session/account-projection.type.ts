import type { components } from "@devhub-404/api-contract";

/** Client projections owned by the application session runtime. */
export type AccountDetailsView = components["schemas"]["AccountDetailsDTO"];
export type AccountShellView = components["schemas"]["AccountShellDTO"];

export function toAccountShellView(
  details: AccountDetailsView,
): AccountShellView {
  return {
    account: {
      id: details.account.id,
      status: details.account.status ?? "active",
    },
    profile: {
      username: details.profile?.username ?? "",
      displayName: details.profile?.displayName ?? null,
      avatarUrl: details.profile?.avatarUrl ?? null,
    },
    preferences: { locale: details.preferences?.locale ?? null },
    role: details.role,
  };
}
