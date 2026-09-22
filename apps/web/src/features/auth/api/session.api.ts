import type { components } from "@devhub-404/api-contract";
import { privateClient, readApiData } from "@/shared/api";
import type { ApiClient, ApiResult } from "@/shared/api";
import type { AuthSession } from "../types/auth-session.type.ts";

export async function resolveCurrentSession(): Promise<AuthSession | null> {
  const result = await privateClient.GET("/api/v1/sessions/current", {
    headers: { "x-devhub-session-resolution": "true" },
  });
  const error = result as unknown as { error?: { code?: string } };
  if (result.response.status === 401) return null;
  if (error.error) {
    throw new Error(error.error.code ?? "SESSION_UNAVAILABLE");
  }
  const payload = result.data as
    | { data?: components["schemas"]["SessionDTO"] }
    | undefined;
  return payload?.data ?? null;
}

export async function logoutCurrentSession() {
  const result = await privateClient.DELETE("/api/v1/sessions/current");
  const error = result as unknown as { error?: { code?: string } };
  return {
    status: result.response.status,
    errorCode: error.error?.code,
  };
}

export async function listSessions(
  client: ApiClient = privateClient,
): Promise<ApiResult<AuthSession[]>> {
  const result = await client.GET("/api/v1/sessions");
  const items = readApiData<{ items?: AuthSession[] }>(result)?.items ?? [];
  return {
    data: { data: items },
    response: result.response,
  } as ApiResult<AuthSession[]>;
}

export function revokeSession(sessionId: string) {
  return privateClient.DELETE("/api/v1/sessions/{sessionId}", {
    params: { path: { sessionId } },
  });
}

export function logoutAllSessions() {
  return privateClient.DELETE("/api/v1/sessions");
}

export function logoutOtherSessions() {
  return privateClient.DELETE("/api/v1/sessions/others");
}
