import { env } from 'cloudflare:workers';
import type { ApiClient } from '@/shared/api/openapi.api.ts';
import { createApiClient } from '@/shared/api/openapi.api.ts';
import { readSessionCookie } from '@/shared/auth/session-cookie';
import { combineAbortSignals } from '@/shared/runtime/abort-signal';

const SSR_API_TIMEOUT_MS = 5000;
const FORWARDED_REQUEST_HEADERS = ['accept', 'accept-language', 'origin', 'user-agent'];

export function createSsrFetch(request: Request): (input: Request) => Promise<Response> {
  const sessionCookie = readSessionCookie(request);
  const appEnv = String(env.APP_ENV);

  return async (input: Request): Promise<Response> => {
    const headers = new Headers();
    for (const name of FORWARDED_REQUEST_HEADERS) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    if (sessionCookie) headers.set('cookie', sessionCookie);
    if (input.body) headers.set('content-type', input.headers.get('content-type') ?? 'application/json');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SSR_API_TIMEOUT_MS);
    try {
      const forwardedRequest = new Request(input, {
        headers,
        signal: combineAbortSignals(input.signal, controller.signal),
      });
      if (appEnv === 'development' || appEnv === 'test') {
        const target = new URL(forwardedRequest.url);
        const configuredApi = new URL(env.API_URL);
        target.protocol = 'http:';
        target.hostname = '127.0.0.1';
        target.port = configuredApi.port || (appEnv === 'test' ? '3000' : '8080');
        return await fetch(new Request(target, forwardedRequest));
      }
      return await env.API.fetch(forwardedRequest);
    } finally {
      clearTimeout(timeout);
    }
  };
}

/** Request-scoped SSR client. Production bypasses the public Worker origin. */
export function createSsrApiClient(request: Request): ApiClient {
  return createApiClient({
    baseUrl: 'http://api.internal',
    credentials: 'include',
    fetch: createSsrFetch(request),
  });
}
