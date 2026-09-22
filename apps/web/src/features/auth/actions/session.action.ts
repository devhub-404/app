import { authCoordinator } from "../runtime/auth-runtime";
import { $auth } from "../store/auth.store.ts";
import {
  listSessions as listSessionsRequest,
  logoutAllSessions as logoutAllSessionsRequest,
  logoutOtherSessions as logoutOtherSessionsRequest,
  revokeSession as revokeSessionRequest,
} from "../api/session.api.ts";
import type { ApiClient } from "@/shared/api";

type ProtectedSessionActionResult =
  | { kind: "success" }
  | { kind: "proof-required" }
  | { kind: "failure"; code?: string };

export async function refreshSessions(client?: ApiClient) {
  const { data, error } = await listSessionsRequest(client);
  if (error) return { ok: false as const, items: [], code: error.code };
  return { ok: true as const, items: data?.data ?? [] };
}

async function protectedSessionAction(
  request: () => Promise<{ error?: { code?: string } }>,
  onSuccess?: () => Promise<void> | void,
): Promise<ProtectedSessionActionResult> {
  try {
    const result = await request();
    if (result.error?.code === "AUTH_REQUIRED")
      return { kind: "proof-required" };
    if (result.error) return { kind: "failure", code: result.error.code };
    await onSuccess?.();
    return { kind: "success" };
  } catch {
    return { kind: "failure", code: "NETWORK_REQUEST_FAILED" };
  }
}

export function revokeSession(sessionId: string) {
  return protectedSessionAction(
    () => revokeSessionRequest(sessionId),
    () => {
      const state = $auth.get();
      if (state.status === "authenticated" && state.session.id === sessionId) {
        authCoordinator.invalidate();
      }
    },
  );
}

export function logoutAllSessions() {
  return protectedSessionAction(
    () => logoutAllSessionsRequest(),
    () => authCoordinator.invalidate(),
  );
}

export function logoutOtherSessions() {
  return protectedSessionAction(() => logoutOtherSessionsRequest());
}
