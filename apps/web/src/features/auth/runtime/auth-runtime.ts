import { onCleanup, onMount } from "solid-js";
import type { AuthSession } from "../types/auth-session.type.ts";
import { resolveCurrentSession, logoutCurrentSession } from "../api/session.api.ts";
import {
  createAuthCoordinator,
  type AuthCoordinatorOptions,
} from "./auth-coordinator.ts";
import { createAuthSessionLifecycleBus } from "./session-sync.ts";
import {
  $auth,
  setAuthenticatedSession,
  setAnonymousSession,
  setAuthUnavailable,
} from "../store/auth.store.ts";
import { observePrivateAuthResponses } from "@/shared/api/private-client.api.ts";

const lifecycleBus = createAuthSessionLifecycleBus();
const coordinatorOptions: AuthCoordinatorOptions = {
  bus: lifecycleBus,
  gateway: { resolveCurrentSession, logoutCurrentSession },
};
export const authCoordinator = createAuthCoordinator(coordinatorOptions);
export const authSessionLifecycleBus = lifecycleBus;

export type AuthRuntimeProps = {
  initialResolution?: "authenticated" | "unauthenticated" | "unavailable" | "deferred";
  initialSession?: AuthSession | null;
};

export function initializeAuthRuntime(props: AuthRuntimeProps = {}) {
  if (props.initialResolution === "authenticated" && props.initialSession) {
    setAuthenticatedSession(props.initialSession);
  } else if (props.initialResolution === "unauthenticated") {
    setAnonymousSession();
  } else if (props.initialResolution === "unavailable") {
    setAuthUnavailable();
  }
  const stop = authCoordinator.start();
  const stopResponseObserver = observePrivateAuthResponses(async (_request, response) => {
    if (response.url.includes("/sessions/current")) return;
    let code: string | undefined;
    try {
      const body = (await response.clone().json()) as { code?: string };
      code = body.code;
    } catch {
      // The response may not have a JSON error envelope.
    }
    if (code !== "AUTH_REQUIRED") authCoordinator.invalidate();
  });
  if (
    props.initialResolution === "deferred" ||
    (props.initialResolution === undefined && $auth.get().status === "unknown")
  ) {
    void authCoordinator.resolve();
  }
  return () => {
    stopResponseObserver();
    stop();
  };
}

export default function AuthRuntime(props: AuthRuntimeProps) {
  onMount(() => {
    const stop = initializeAuthRuntime(props);
    onCleanup(stop);
  });
  return null;
}
