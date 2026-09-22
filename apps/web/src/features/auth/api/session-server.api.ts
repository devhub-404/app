import type { components } from "@devhub-404/api-contract";
import { readSessionCookie } from "@/shared/auth/session-cookie";
import { createSsrFetch } from "@/shared/api/ssr-client.api.ts";
import type { AccountShellView } from "@/features/account/types/account-details-view.type.ts";

export type AuthSessionView = components["schemas"]["SessionDTO"];
export type SessionResolution =
  | {
      status: "authenticated";
      session: AuthSessionView;
      account: AccountShellView;
    }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

function responseData<T>(body: unknown): T | undefined {
  if (!body || typeof body !== "object") return undefined;
  const data = (body as { data?: unknown }).data;
  return data as T | undefined;
}

export async function resolveSession(
  request: Request,
): Promise<SessionResolution> {
  const cookie = readSessionCookie(request);
  if (!cookie) return { status: "unauthenticated" };

  try {
    const fetcher = createSsrFetch(request);
    const headers = { cookie };
    const sessionResponse = await fetcher(
      new Request(new URL("/api/v1/sessions/current", request.url), {
        headers,
      }),
    );
    if (sessionResponse.status === 401)
      return { status: "unauthenticated" };
    if (!sessionResponse.ok) return { status: "unavailable" };

    const session = responseData<AuthSessionView>(
      await sessionResponse.json(),
    );
    if (!session) return { status: "unavailable" };

    const accountResponse = await fetcher(
      new Request(new URL("/api/v1/me", request.url), { headers }),
    );
    if (accountResponse.status === 401) return { status: "unavailable" };
    if (!accountResponse.ok) return { status: "unavailable" };
    const account = responseData<AccountShellView>(
      await accountResponse.json(),
    );
    return account
      ? { status: "authenticated", session, account }
      : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}

