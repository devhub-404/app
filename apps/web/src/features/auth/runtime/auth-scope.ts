import {
  $auth,
  beginAuthResolution,
  getAuthSignal,
  invalidateAuthSession,
  setAuthenticatedSession,
  setAnonymousSession,
  setAuthUnavailable,
} from "../store/auth.store.ts";
import { atom } from "nanostores";
import type { AuthSession } from "../types/auth-session.type.ts";

export type AuthSessionScopeStatus =
  | "unknown"
  | "resolving"
  | "anonymous"
  | "authenticated"
  | "unavailable"
  | "invalidating";

export type AuthSessionScopeState = {
  status: AuthSessionScopeStatus;
  accountId: string | null;
  sessionId: string | null;
  revision: number;
};

export type AuthSessionScope = AuthSessionScopeState & {
  signal: AbortSignal;
};

function snapshot(): AuthSessionScopeState {
  const state = $auth.get();
  return {
    status: state.status,
    accountId:
      state.status === "authenticated" ? state.session.userId : null,
    sessionId: state.status === "authenticated" ? state.session.id : null,
    revision: state.revision,
  };
}

export const $authSessionScope = atom<AuthSessionScopeState>(snapshot());
$auth.listen(() => $authSessionScope.set(snapshot()));

export function getAuthSessionScope(): AuthSessionScope {
  return { ...snapshot(), signal: getAuthSignal() };
}

export function initializeAuthSessionScope(
  resolution: "authenticated" | "unauthenticated" | "unavailable" | "deferred",
  session?: AuthSession | null,
) {
  if ($auth.get().status !== "unknown") return;
  if (resolution === "authenticated" && session) {
    setAuthenticatedSession(session);
    return;
  }
  if (resolution === "unavailable") {
    setAuthUnavailable();
    return;
  }
  if (resolution === "deferred") {
    beginAuthResolution();
    return;
  }
  setAnonymousSession();
}

export function isCurrentAuthSession(
  scope: Pick<AuthSessionScope, "accountId" | "sessionId" | "revision">,
) {
  const current = getAuthSessionScope();
  return (
    current.revision === scope.revision &&
    current.accountId === scope.accountId &&
    current.sessionId === scope.sessionId &&
    !current.signal.aborted
  );
}

export function isAuthenticatedAuthSession(accountId?: string | null) {
  const current = getAuthSessionScope();
  return (
    current.status === "authenticated" &&
    (accountId === undefined || current.accountId === accountId) &&
    !current.signal.aborted
  );
}

export {
  beginAuthResolution,
  invalidateAuthSession,
  setAuthenticatedSession,
  setAnonymousSession,
  setAuthUnavailable,
};

export const getSessionScope = getAuthSessionScope;
export const isCurrentSessionScope = isCurrentAuthSession;
export const isAuthenticatedSessionScope = isAuthenticatedAuthSession;
