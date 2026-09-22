import { atom } from "nanostores";
import type { components } from "@devhub-404/api-contract";

export type CurrentSession = components["schemas"]["SessionDTO"];

/** Current session metadata is application state, not auth-feature state. */
export const $appCurrentSession = atom<CurrentSession | null>(null);

export function setAppCurrentSession(session: CurrentSession | null) {
  $appCurrentSession.set(session);
}

export function clearAppCurrentSession() {
  $appCurrentSession.set(null);
}
