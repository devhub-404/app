import { privateClient } from '@/shared/api';

/**
 * The session bootstrap must stay independent from the authentication
 * ceremonies (OPAQUE, WebAuthn, MFA and OAuth).
 */
export function getCurrentSession(options?: { signal?: AbortSignal }) {
  return privateClient.GET('/api/v1/sessions/current', { signal: options?.signal });
}

export function logout() {
  return privateClient.DELETE('/api/v1/sessions/current');
}
