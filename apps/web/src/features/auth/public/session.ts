export {
  $auth,
  resetAuthState,
} from "../store/auth.store.ts";
import {
  authCoordinator,
} from "../runtime/auth-runtime";
export {
  authCoordinator,
  authSessionLifecycleBus,
} from "../runtime/auth-runtime";
export type { AuthSession, AuthState } from "../types/auth-session.type.ts";

export function establishAuthSession() {
  return authCoordinator.establish();
}

export async function invalidateAuthSession() {
  authCoordinator.invalidate();
}
