import { env } from '@/app/config/env';

/**
 * Headers a same-origin browser sends for an authority-bearing mutation.
 * Keep authenticated HTTP contract tests behind the same CSRF gate as the
 * real browser so they exercise the intended use case rather than stopping
 * at AuthGuard.
 */
export function browserMutationHeaders(): Record<string, string> {
  return {
    Origin: new URL(env.siteUrl).origin,
    'Sec-Fetch-Site': 'same-origin',
  };
}
