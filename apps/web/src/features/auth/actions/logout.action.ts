import { notifySessionInvalidated } from '@/shared/api';
import { logout as logoutSession } from '@/features/auth/api/session.api.ts';

export type LogoutResult =
  { ok: true; alreadyInvalidated: boolean } | { ok: false; code: 'NETWORK_REQUEST_FAILED' | 'INTERNAL_SERVER_ERROR' };

/**
 * Publishes the local lifecycle consequence of a Session that the server has
 * already made unusable. Cross-domain stores are reconciled by the app
 * runtime; Auth does not reach into Account or feature caches directly.
 */
export async function invalidateLocalSession(options: { broadcast?: boolean } = {}) {
  notifySessionInvalidated({ broadcast: options.broadcast });
}

export async function logout(): Promise<LogoutResult> {
  let result: Awaited<ReturnType<typeof logoutSession>>;
  try {
    result = await logoutSession();
  } catch {
    return { ok: false, code: 'NETWORK_REQUEST_FAILED' };
  }

  const status = result.response.status;
  // 401 means the credential is already unusable, which satisfies the user's
  // requested postcondition. Any other failure keeps local state intact.
  if ((status < 200 || status >= 300) && status !== 401) {
    return { ok: false, code: 'INTERNAL_SERVER_ERROR' };
  }

  await invalidateLocalSession();
  return { ok: true, alreadyInvalidated: status === 401 };
}
