export {
  $auth,
  resetAuthState,
} from "../store/auth.store.ts";
export {
  authCoordinator,
  authSessionLifecycleBus,
} from "../runtime/auth-runtime";
export type { AuthSession, AuthState } from "../types/auth-session.type.ts";

export async function establishAuthSession() {
  const { authCoordinator } = await import("../runtime/auth-runtime");
  return authCoordinator.establish();
}

export async function invalidateAuthSession() {
  const { authCoordinator } = await import("../runtime/auth-runtime");
  return authCoordinator.invalidate();
}
