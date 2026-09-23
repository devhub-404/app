import { privateClient } from "@/shared/api";
import { isAbortError } from "@/shared/runtime/abort-signal";
import {
  $account,
  setAccountDetails,
  setAccountLoading,
  setAccountUnavailable,
} from "../store/account-projection.store.ts";
import type { AccountDetailsView } from "../types/account-details-view.type.ts";
import {
  getAuthSessionScope,
  isCurrentAuthSession,
} from "@/features/auth/public/session.ts";

let bootstrapPromise: Promise<AccountDetailsView | null> | null = null;

async function fetchAccount(): Promise<AccountDetailsView> {
  const requestScope = getAuthSessionScope();
  const { data } = await privateClient.GET("/api/v1/me/details", {
    headers: { "x-devhub-session-resolution": "true" },
    signal: requestScope.signal,
  });
  const currentScope = getAuthSessionScope();
  if (
    (requestScope.status === "authenticated" &&
      !isCurrentAuthSession(requestScope)) ||
    currentScope.status === "anonymous" ||
    currentScope.status === "invalidating"
  ) {
    const stale = new Error("SESSION_SCOPE_STALE");
    stale.name = "AbortError";
    throw stale;
  }
  const details = (data as { data?: AccountDetailsView } | undefined)?.data;
  if (!details) throw new Error("ACCOUNT_NOT_FOUND");
  return details;
}

export async function bootstrapAccount(): Promise<AccountDetailsView | null> {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    try {
      const snapshot = $account.get();
      if (snapshot.details) return snapshot.details;
      setAccountLoading();
      const details = await fetchAccount();
      setAccountDetails(details);
      return details;
    } catch (error) {
      if (isAbortError(error)) return null;
      const message =
        error instanceof Error && error.message
          ? error.message
          : "NETWORK_REQUEST_FAILED";
      setAccountUnavailable(message);
      throw error;
    } finally {
      bootstrapPromise = null;
    }
  })();
  return bootstrapPromise;
}

export async function refreshAccount(): Promise<AccountDetailsView> {
  setAccountLoading();
  try {
    const details = await fetchAccount();
    setAccountDetails(details);
    return details;
  } catch (error) {
    if (isAbortError(error)) throw error;
    const message =
      error instanceof Error && error.message
        ? error.message
        : "NETWORK_REQUEST_FAILED";
    setAccountUnavailable(message);
    throw error;
  }
}
