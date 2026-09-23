import createClient from "openapi-fetch";
import type { paths } from "@devhub-404/api-contract";
import { baseURL } from "@/shared/api/base-url.api.ts";
import { publicClient } from "@/shared/api/openapi.api.ts";
import { combineAbortSignals } from "@/shared/runtime/abort-signal";
import {
  $authSessionScope,
  getAuthSessionScope,
  isAuthenticatedAuthSession,
} from "@/features/auth/public/session.ts";

const openApiBaseUrl = baseURL.replace(/\/api\/?$/, "");
const SESSION_RESOLUTION_HEADER = "x-devhub-session-resolution";
const SESSION_WAIT_TIMEOUT_MS = 5_000;
type PrivateAuthResponseObserver = (
  request: Request,
  response: Response,
) => void | Promise<void>;
let privateAuthResponseObserver: PrivateAuthResponseObserver | null = null;

export const privateClient = createClient<paths>({
  baseUrl: openApiBaseUrl,
  credentials: "include",
});

export function observePrivateAuthResponses(
  observer: PrivateAuthResponseObserver,
) {
  privateAuthResponseObserver = observer;
  return () => {
    if (privateAuthResponseObserver === observer)
      privateAuthResponseObserver = null;
  };
}

function ensureOnline() {
  if (typeof window !== "undefined" && window.navigator?.onLine === false) {
    throw new Error(
      "Network Error: You are currently offline. Please check your internet connection.",
    );
  }
}

function withoutSessionResolutionHeader(request: Request): Request {
  const headers = new Headers(request.headers);
  headers.delete(SESSION_RESOLUTION_HEADER);
  return new Request(request, { headers });
}

function sessionUnavailableError(): Error {
  const error = new Error("AUTHENTICATION_REQUIRED");
  // A request blocked by the lifecycle coordinator is not a network failure;
  // consumers should silently abandon it just like an aborted request.
  error.name = "AbortError";
  return error;
}

function withSessionSignal(request: Request, signal: AbortSignal): Request {
  return new Request(request, {
    signal: combineAbortSignals(request.signal, signal),
  });
}

function waitForAuthenticatedSession(request: Request): Promise<Request> {
  const current = getAuthSessionScope();
  if (isAuthenticatedAuthSession(current.accountId)) {
    return Promise.resolve(withSessionSignal(request, current.signal));
  }

  if (
    current.status === "anonymous" ||
    current.status === "unavailable" ||
    current.status === "invalidating"
  ) {
    return Promise.reject(sessionUnavailableError());
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    let stop = () => {};
    const timeout = window.setTimeout(
      () => finish(sessionUnavailableError()),
      SESSION_WAIT_TIMEOUT_MS,
    );
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      stop();
      window.clearTimeout(timeout);
      if (error) reject(error);
    else resolve(withSessionSignal(request, getAuthSessionScope().signal));
    };
    const evaluate = () => {
      const scope = getAuthSessionScope();
      if (isAuthenticatedAuthSession(scope.accountId)) finish();
      else if (
        scope.status === "anonymous" ||
        scope.status === "unavailable" ||
        scope.status === "invalidating"
      ) {
        finish(sessionUnavailableError());
      }
    };
    stop = $authSessionScope.listen(evaluate);
    evaluate();
  });
}

publicClient.use({
  async onRequest({ request }) {
    ensureOnline();
    return request;
  },
});

privateClient.use({
  async onRequest({ request }) {
    ensureOnline();
    if (request.headers.get(SESSION_RESOLUTION_HEADER) === "true") {
      const cleanRequest = withoutSessionResolutionHeader(request);
      if (typeof window === "undefined") return cleanRequest;
      const scope = getAuthSessionScope();
      if (
        scope.status === "anonymous" ||
        scope.status === "unavailable" ||
        scope.status === "invalidating"
      ) {
        return Promise.reject(sessionUnavailableError());
      }
      // The resolution request establishes the authenticated scope. Do not
      // bind an unknown/resolving request to the signal that will be rotated
      // when that resolution succeeds; otherwise the request can be aborted
      // before the browser sends its session cookie.
      return scope.status === "authenticated"
        ? withSessionSignal(cleanRequest, scope.signal)
        : cleanRequest;
    }
    if (typeof window === "undefined") return request;
    return waitForAuthenticatedSession(request);
  },
});

privateClient.use({
  async onResponse({ response }) {
    if (response.status !== 401 || typeof window === "undefined")
      return response;
    // Auth owns the consequence of a 401. The transport only forwards the
    // response to the one registered coordinator.
    await privateAuthResponseObserver?.(new Request(response.url), response);
    return response;
  },
});
