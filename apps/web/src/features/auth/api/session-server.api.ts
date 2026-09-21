import type { components } from '@devhub-404/api-contract';
import { readSessionCookie } from '@/shared/auth/session-cookie';
import { createSsrFetch } from '@/shared/api/ssr-client.api.ts';

export type SessionProjection = components['schemas']['AccountShellDTO'];
export type SessionResolution =
  | { status: 'authenticated'; session: SessionProjection }
  | { status: 'unauthenticated' }
  | { status: 'unavailable' };

export async function resolveSession(request: Request): Promise<SessionResolution> {
  const cookie = readSessionCookie(request);
  if (!cookie) return { status: 'unauthenticated' };

  try {
    const response = await createSsrFetch(request)(new Request(new URL('/api/v1/me', request.url), { headers: { cookie } }));
    if (response.status === 401) return { status: 'unauthenticated' };
    if (!response.ok) return { status: 'unavailable' };
    const body = (await response.json()) as { data?: SessionProjection };
    return body.data ? { status: 'authenticated', session: body.data } : { status: 'unavailable' };
  } catch {
    return { status: 'unavailable' };
  }
}
