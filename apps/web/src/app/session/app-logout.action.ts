import { notifyAppSessionInvalidated } from "./app-session.lifecycle";
import { logoutCurrentAppSession } from "./app-current-session.service";

export type AppLogoutResult =
  | { ok: true; alreadyInvalidated: boolean }
  | { ok: false; code: "NETWORK_REQUEST_FAILED" | "INTERNAL_SERVER_ERROR" };

/** Applies the local consequence of a server-invalidated application session. */
export async function invalidateAppSession(
  options: { broadcast?: boolean } = {},
) {
  notifyAppSessionInvalidated({ broadcast: options.broadcast });
}

export async function logoutAppSession(): Promise<AppLogoutResult> {
  let result: Awaited<ReturnType<typeof logoutCurrentAppSession>>;
  try {
    result = await logoutCurrentAppSession();
  } catch {
    return { ok: false, code: "NETWORK_REQUEST_FAILED" };
  }

  const status = result.response.status;
  if ((status < 200 || status >= 300) && status !== 401) {
    return { ok: false, code: "INTERNAL_SERVER_ERROR" };
  }

  await invalidateAppSession();
  return { ok: true, alreadyInvalidated: status === 401 };
}
