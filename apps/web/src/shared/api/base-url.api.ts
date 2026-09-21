import { env } from '@/shared/runtime/env';

/**
 * Browser traffic is same-origin in production so the host-only HttpOnly
 * Session cookie is scoped only to the frontend origin. The Cloudflare Worker
 * proxies `/api/*` to the backend container. SSR uses the configured absolute
 * origin because server-side fetch requires an absolute URL.
 */
export const baseURL = env.isDev ? env.apiUrl : typeof window === 'undefined' ? env.apiUrl : '/api';
