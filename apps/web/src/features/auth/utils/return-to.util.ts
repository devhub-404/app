import type { OAuthProvider } from '@/features/auth/types/auth.type.ts';
import type { OAuthFlow } from '@/features/auth/types';
import { routes } from '@/shared/navigation/routes';

const RETURN_TO_BASE = 'https://devhub.invalid';

export function sanitizeReturnTo(value: string | null | undefined, fallback = routes.feed): string {
  if (!value) return fallback;
  try {
    const parsed = new URL(value, RETURN_TO_BASE);
    if (parsed.origin !== RETURN_TO_BASE) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function returnToFromSearch(search: string, fallback = routes.feed): string {
  const params = new URLSearchParams(search);
  return sanitizeReturnTo(params.get('redirect'), fallback);
}

function oauthReturnToKey(provider: OAuthProvider, flow: OAuthFlow): string {
  return `devhub:oauth-return-to:${flow}:${provider}`;
}

export function rememberOAuthReturnTo(provider: OAuthProvider, flow: OAuthFlow, value: string): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(oauthReturnToKey(provider, flow), sanitizeReturnTo(value));
}

export function takeOAuthReturnTo(provider: OAuthProvider, flow: OAuthFlow, fallback = routes.feed): string {
  if (typeof window === 'undefined') return fallback;
  const key = oauthReturnToKey(provider, flow);
  const value = window.sessionStorage.getItem(key);
  window.sessionStorage.removeItem(key);
  return sanitizeReturnTo(value, fallback);
}
