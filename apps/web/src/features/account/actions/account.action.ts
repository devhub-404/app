import { AccountApi } from "@/features/account/api/account.api.ts";
import type { OAuthProvider } from "@/features/account/types/account.type.ts";
import type { AccountDetailsView } from "@/features/account/types";
import {
  bootstrapAppAccount,
  refreshAppAccount,
} from "@/app/session/app-session.actions";
import {
  $appAccount as $account,
  setAccountDetails,
} from "@/app/session/app-account.store";
import { invalidateAppSession } from "@/app/session/public";
import { isAbortError } from "@/shared/runtime/abort-signal";

export type ProtectedAccountActionResult =
  | { kind: "success" }
  | { kind: "proof-required" }
  | { kind: "failure"; code?: string };

type ProtectedResponse = { error?: { code?: string } };

type MutationResponse<T = unknown> = {
  data?: { code?: string; data?: T };
  error?: { code?: string };
};

async function runAccountMutation<T>(
  request: () => Promise<MutationResponse<T>>,
  onSuccess?: (result: MutationResponse<T>) => Promise<void> | void,
): Promise<boolean> {
  try {
    const result = await request();
    if (result.error) return false;
    await onSuccess?.(result);
    return true;
  } catch (error) {
    if (isAbortError(error)) return false;
    return false;
  }
}

async function runProtectedAccountAction(
  request: () => Promise<ProtectedResponse>,
  onSuccess?: () => Promise<void> | void,
): Promise<ProtectedAccountActionResult> {
  try {
    const result = await request();
    if (result.error?.code === "AUTH_REQUIRED")
      return { kind: "proof-required" };
    if (result.error) return { kind: "failure", code: result.error.code };
    await onSuccess?.();
    return { kind: "success" };
  } catch (error) {
    if (isAbortError(error))
      return { kind: "failure", code: "REQUEST_ABORTED" };
    return { kind: "failure", code: "NETWORK_REQUEST_FAILED" };
  }
}

function updateDetails(
  updater: (current: AccountDetailsView) => AccountDetailsView,
) {
  const current = $account.get();
  if (!current.details) return;
  setAccountDetails(updater(current.details));
}

export const bootstrapAccount = bootstrapAppAccount;
export const refreshAccount = refreshAppAccount;

export async function refreshSessions() {
  const { data, error } = await AccountApi.listSessions();
  if (error) {
    return { ok: false as const, items: [], code: error.code };
  }
  const sessions = Array.isArray(data?.data) ? data?.data : [];
  return { ok: true as const, items: sessions };
}

export async function revokeSession(id: string) {
  return runProtectedAccountAction(() => AccountApi.revokeSession(id));
}

export async function logoutAllSessions() {
  return runProtectedAccountAction(
    () => AccountApi.logoutAllSessions(),
    async () => {
      // This endpoint revokes the current Session as part of the full set.
      await invalidateAppSession();
    },
  );
}

export async function logoutOtherSessions() {
  return runProtectedAccountAction(() => AccountApi.logoutOtherSessions());
}

export async function refreshOAuthLinks() {
  const { data, error } = await AccountApi.listOAuthLinks();
  if (error) {
    throw new Error(error.code ?? "NETWORK_REQUEST_FAILED");
  }
  return Array.isArray(data?.data) ? data?.data : [];
}

export async function linkOAuthProvider(
  provider: OAuthProvider,
  payload: Parameters<typeof AccountApi.linkOAuthProvider>[1],
) {
  return runAccountMutation(
    () => AccountApi.linkOAuthProvider(provider, payload),
    async () => {
      await refreshOAuthLinks();
    },
  );
}

export async function unlinkOAuthProvider(provider: OAuthProvider) {
  return runAccountMutation(() => AccountApi.unlinkOAuthProvider(provider));
}

export async function requestPrimaryEmailChange(
  payload: Parameters<typeof AccountApi.requestPrimaryEmailChange>[0],
) {
  return runAccountMutation(() =>
    AccountApi.requestPrimaryEmailChange(payload),
  );
}

export async function completePrimaryEmailChange(
  payload: Parameters<typeof AccountApi.completePrimaryEmailChange>[0],
) {
  return runAccountMutation(
    () => AccountApi.completePrimaryEmailChange(payload),
    async () => {
      await refreshAccount();
    },
  );
}

export async function requestAddEmail(
  payload: Parameters<typeof AccountApi.requestAddEmail>[0],
) {
  return runAccountMutation(() => AccountApi.requestAddEmail(payload));
}

export async function startEmailVerification() {
  return runAccountMutation(() => AccountApi.startEmailVerification());
}

export async function resendAddEmailVerification(
  payload: Parameters<typeof AccountApi.resendAddEmailVerification>[0],
) {
  return runAccountMutation(() =>
    AccountApi.resendAddEmailVerification(payload),
  );
}

export async function verifyAddEmail(
  payload: Parameters<typeof AccountApi.verifyAddEmail>[0],
) {
  return runAccountMutation(
    () => AccountApi.verifyAddEmail(payload),
    async () => {
      await refreshAccount();
    },
  );
}

export async function removeBackupEmail() {
  return runAccountMutation(
    () => AccountApi.removeBackupEmail(),
    async () => {
      await refreshAccount();
    },
  );
}

export async function updatePreferences(
  payload: Parameters<typeof AccountApi.updatePreferences>[0],
) {
  return runAccountMutation(
    () => AccountApi.updatePreferences(payload),
    (result) => {
      const preferences = result.data?.data;
      if (!preferences) return;
      updateDetails((details) => ({ ...details, preferences }));
    },
  );
}
export async function getPreferences() {
  const { data, error } = await AccountApi.getPreferences();
  const preferences = data?.data;
  const current = $account.get();
  if (!error && preferences && current.details)
    setAccountDetails({ ...current.details, preferences });
  return { preferences: preferences ?? null, error };
}

export async function disableAccount() {
  return runAccountMutation(
    () => AccountApi.disableMe(),
    async () => {
      // Account deactivation revokes Sessions server-side (AUTH-RN-011).
      // Do not issue a second authenticated DELETE with an already-invalid cookie.
      await invalidateAppSession();
    },
  );
}

export async function deleteAccount() {
  return runProtectedAccountAction(
    () => AccountApi.deleteMe(),
    async () => {
      // deletion=PENDING revokes Sessions server-side (ACC-RN-005/AUTH-RN-011).
      await invalidateAppSession();
    },
  );
}

export async function getAccountOverview(
  client: import("@/shared/api").ApiClient,
) {
  const [detailsResult, sessionsResult] = await Promise.all([
    AccountApi.getDetails(client),
    AccountApi.listSessions(client),
  ]);

  if (detailsResult.error || !detailsResult.data?.data) {
    return { kind: "unavailable" as const };
  }

  return {
    kind: "ready" as const,
    details: detailsResult.data.data,
    sessionCount: sessionsResult.error
      ? null
      : (sessionsResult.data?.data?.length ?? 0),
  };
}

export async function getAccountSessions(
  client: import("@/shared/api").ApiClient,
) {
  const { data, error } = await AccountApi.listSessions(client);
  if (error) return { kind: "unavailable" as const, items: [] };
  return { kind: "ready" as const, items: data?.data ?? [] };
}
