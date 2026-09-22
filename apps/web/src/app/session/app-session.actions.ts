import { privateClient } from "@/shared/api";
import { isAbortError } from "@/shared/runtime/abort-signal";
import {
  $appAccount,
  setAccountDetails,
  setAccountLoading,
  setAccountUnavailable,
} from "./app-account.store";
import type { AccountDetailsView } from "./account-projection.type.ts";
import {
  getSessionScope,
  isCurrentSessionScope,
  setAuthenticatedSessionScope,
} from "./session-scope";

let bootstrapPromise: Promise<AccountDetailsView | null> | null = null;

async function fetchAccount(): Promise<AccountDetailsView> {
  const requestScope = getSessionScope();
  const { data } = await privateClient.GET("/api/v1/me/details", {
    headers: { "x-devhub-session-resolution": "true" },
    signal: requestScope.signal,
  });
  const currentScope = getSessionScope();

  if (
    (requestScope.status === "authenticated" &&
      !isCurrentSessionScope(requestScope)) ||
    currentScope.status === "anonymous" ||
    currentScope.status === "invalidating"
  ) {
    const stale = new Error("SESSION_SCOPE_STALE");
    stale.name = "AbortError";
    throw stale;
  }

  // openapi-fetch returns the API response envelope in `data` itself.
  // `readApiData` accepts the complete client result, so unwrap the envelope
  // here without treating the account DTO as another client result.
  const details = (data as { data?: AccountDetailsView } | undefined)?.data;
  if (!details) throw new Error("ACCOUNT_NOT_FOUND");
  return details;
}

export async function bootstrapAppAccount(): Promise<AccountDetailsView | null> {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      const snapshot = $appAccount.get();
      if (snapshot.details) return snapshot.details;
      setAccountLoading();
      const details = await fetchAccount();
      setAccountDetails(details);
      setAuthenticatedSessionScope(details.account.id);
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

export async function refreshAppAccount(): Promise<AccountDetailsView> {
  setAccountLoading();
  try {
    const details = await fetchAccount();
    setAccountDetails(details);
    setAuthenticatedSessionScope(details.account.id);
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
