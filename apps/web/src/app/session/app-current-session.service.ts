import type { components } from "@devhub-404/api-contract";
import { privateClient, readApiData } from "@/shared/api";
import { isAbortError } from "@/shared/runtime/abort-signal";
import {
  clearAppCurrentSession,
  setAppCurrentSession,
} from "./app-current-session.store";

export function getAppCurrentSession(options?: { signal?: AbortSignal }) {
  return privateClient.GET("/api/v1/sessions/current", {
    signal: options?.signal,
  });
}

export function logoutCurrentAppSession() {
  return privateClient.DELETE("/api/v1/sessions/current");
}

export async function refreshAppCurrentSession(options?: {
  signal?: AbortSignal;
}) {
  try {
    const result = await getAppCurrentSession(options);
    if (result.error) {
      clearAppCurrentSession();
      return null;
    }
    const session =
      readApiData<components["schemas"]["SessionDTO"]>(result.data) ?? null;
    setAppCurrentSession(session);
    return session;
  } catch (error) {
    if (isAbortError(error)) return null;
    throw error;
  }
}

export { clearAppCurrentSession as clearCurrentAppSession };
