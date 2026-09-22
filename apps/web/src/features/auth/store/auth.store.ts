import { atom } from "nanostores";
import type { AuthSession, AuthState } from "../types/auth-session.type.ts";

const initialState: AuthState = {
  status: "unknown",
  session: null,
  revision: 0,
};

export const $auth = atom<AuthState>(initialState);

let controller = new AbortController();

function rotate(next: Omit<AuthState, "revision">) {
  controller.abort();
  controller = new AbortController();
  $auth.set({ ...next, revision: $auth.get().revision + 1 } as AuthState);
}

export function beginAuthResolution() {
  if ($auth.get().status === "resolving") return;
  rotate({ status: "resolving", session: null });
}

export function setAuthenticatedSession(session: AuthSession) {
  const current = $auth.get();
  if (current.status === "authenticated" && current.session.id === session.id) {
    $auth.set({ ...current, session });
    return;
  }
  rotate({ status: "authenticated", session });
}

export function setAnonymousSession() {
  if ($auth.get().status === "anonymous") return;
  rotate({ status: "anonymous", session: null });
}

export function setAuthUnavailable() {
  if ($auth.get().status === "unavailable") return;
  rotate({ status: "unavailable", session: null });
}

export function invalidateAuthSession() {
  if ($auth.get().status === "invalidating") return;
  rotate({ status: "invalidating", session: null });
}

export function resetAuthState() {
  controller.abort();
  controller = new AbortController();
  $auth.set(initialState);
}

export function getAuthSignal() {
  return controller.signal;
}
