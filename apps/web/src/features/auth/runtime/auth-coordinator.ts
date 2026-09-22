import {
  beginAuthResolution,
  setAuthenticatedSession,
  setAnonymousSession,
  setAuthUnavailable,
  $auth,
} from "../store/auth.store.ts";
import type { AuthSession } from "../types/auth-session.type.ts";
import type {
  AuthSessionLifecycleBus,
  AuthSessionLifecycleEvent,
} from "./session-sync.ts";

export type AuthSessionGateway = {
  resolveCurrentSession(): Promise<AuthSession | null>;
  logoutCurrentSession(): Promise<{
    status: number;
    errorCode?: string;
  }>;
};

export type AuthCoordinatorOptions = {
  gateway: AuthSessionGateway;
  bus: AuthSessionLifecycleBus;
};

export type LogoutResult =
  | { ok: true; alreadyInvalidated: boolean }
  | { ok: false; code: string };

export function createAuthCoordinator({ gateway, bus }: AuthCoordinatorOptions) {
  let resolutionPromise: Promise<AuthSession | null> | null = null;
  let logoutPromise: Promise<LogoutResult> | null = null;
  let stopListening: (() => void) | null = null;

  const resolve = (): Promise<AuthSession | null> => {
    const current = $auth.get();
    if (current.status === "authenticated")
      return Promise.resolve(current.session);
    if (resolutionPromise) return resolutionPromise;

    beginAuthResolution();
    resolutionPromise = gateway
      .resolveCurrentSession()
      .then((session) => {
        if (session) setAuthenticatedSession(session);
        else setAnonymousSession();
        return session;
      })
      .catch((error) => {
        setAuthUnavailable();
        throw error;
      })
      .finally(() => {
        resolutionPromise = null;
      });

    return resolutionPromise;
  };

  const establish = async (): Promise<AuthSession | null> => {
    beginAuthResolution();
    const session = await resolve();
    if (session) bus.publish("available");
    return session;
  };

  const invalidate = (broadcast: boolean) => {
    const wasActive = $auth.get().status !== "anonymous";
    setAnonymousSession();
    if (broadcast && wasActive) bus.publish("invalidated");
  };

  const logoutCurrent = (): Promise<LogoutResult> => {
    if (logoutPromise) return logoutPromise;
    if ($auth.get().status === "anonymous")
      return Promise.resolve({ ok: true, alreadyInvalidated: true });

    logoutPromise = gateway
      .logoutCurrentSession()
      .then((result) => {
        if (result.status >= 200 && result.status < 300) {
          setAnonymousSession();
          bus.publish("invalidated");
          return { ok: true, alreadyInvalidated: false } as const;
        }
        if (result.status === 401 && result.errorCode === "UNAUTHORIZED") {
          setAnonymousSession();
          bus.publish("invalidated");
          return { ok: true, alreadyInvalidated: true } as const;
        }
        return {
          ok: false,
          code: result.errorCode ?? "INTERNAL_SERVER_ERROR",
        } as const;
      })
      .catch(() => ({ ok: false, code: "NETWORK_REQUEST_FAILED" }) as const)
      .finally(() => {
        logoutPromise = null;
      });

    return logoutPromise;
  };

  const handleRemoteEvent = (event: AuthSessionLifecycleEvent) => {
    if (event === "invalidated") {
      setAnonymousSession();
      return;
    }
    void resolve();
  };

  return {
    resolve,
    establish,
    logoutCurrent,
    invalidate: () => invalidate(true),
    start() {
      stopListening ??= bus.subscribe(handleRemoteEvent);
      return () => {
        stopListening?.();
        stopListening = null;
      };
    },
    whenIdle() {
      return Promise.all([resolutionPromise, logoutPromise]);
    },
  };
}
