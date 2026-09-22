import { onCleanup, onMount } from "solid-js";
import type { AuthSession } from "../types/auth-session.type.ts";
import { resolveCurrentSession, logoutCurrentSession } from "../api/session.api.ts";
import {
  createAuthCoordinator,
  type AuthCoordinatorOptions,
} from "./auth-coordinator.ts";
import {
  createAuthSessionLifecycleBus,
  type AuthSessionLifecycleBus,
} from "./session-sync.ts";
import {
  $auth,
  setAuthenticatedSession,
  setAnonymousSession,
  setAuthUnavailable,
} from "../store/auth.store.ts";
import { observePrivateAuthResponses } from "@/shared/api/private-client.api.ts";

type AuthCoordinator = ReturnType<typeof createAuthCoordinator>;

type ClientAuthRuntime = {
  coordinator: AuthCoordinator;
  bus: AuthSessionLifecycleBus;
};

let clientRuntime: ClientAuthRuntime | null = null;

function getClientRuntime(): ClientAuthRuntime {
  if (typeof window === "undefined") {
    throw new Error("The auth runtime can only be initialized in the browser.");
  }

  if (!clientRuntime) {
    const bus = createAuthSessionLifecycleBus();
    const coordinatorOptions: AuthCoordinatorOptions = {
      bus,
      gateway: { resolveCurrentSession, logoutCurrentSession },
    };
    clientRuntime = {
      bus,
      coordinator: createAuthCoordinator(coordinatorOptions),
    };
  }

  return clientRuntime;
}

export function getAuthCoordinator() {
  return getClientRuntime().coordinator;
}

export function getAuthSessionLifecycleBus() {
  return getClientRuntime().bus;
}

// Keep the existing public shape while deferring all client-only construction.
export const authCoordinator: AuthCoordinator = {
  resolve: () => getAuthCoordinator().resolve(),
  establish: () => getAuthCoordinator().establish(),
  logoutCurrent: () => getAuthCoordinator().logoutCurrent(),
  invalidate: () => getAuthCoordinator().invalidate(),
  start: () => getAuthCoordinator().start(),
  whenIdle: () => getAuthCoordinator().whenIdle(),
};

export const authSessionLifecycleBus: AuthSessionLifecycleBus = {
  publish: (event) => getAuthSessionLifecycleBus().publish(event),
  subscribe: (listener) => getAuthSessionLifecycleBus().subscribe(listener),
};

export type AuthRuntimeProps = {
  initialResolution?: "authenticated" | "unauthenticated" | "unavailable" | "deferred";
  initialSession?: AuthSession | null;
};

export function initializeAuthRuntime(props: AuthRuntimeProps = {}) {
  const { coordinator } = getClientRuntime();
  if (props.initialResolution === "authenticated" && props.initialSession) {
    setAuthenticatedSession(props.initialSession);
  } else if (props.initialResolution === "unauthenticated") {
    setAnonymousSession();
  } else if (props.initialResolution === "unavailable") {
    setAuthUnavailable();
  }
  const stop = coordinator.start();
  const stopResponseObserver = observePrivateAuthResponses(async (_request, response) => {
    if (response.url.includes("/sessions/current")) return;
    let code: string | undefined;
    try {
      const body = (await response.clone().json()) as { code?: string };
      code = body.code;
    } catch {
      // The response may not have a JSON error envelope.
    }
    if (code !== "AUTH_REQUIRED") coordinator.invalidate();
  });
  if (
    props.initialResolution === "deferred" ||
    (props.initialResolution === undefined && $auth.get().status === "unknown")
  ) {
    void coordinator.resolve();
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
