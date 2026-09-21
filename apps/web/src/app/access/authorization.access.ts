import type { SessionResolution } from '@/features/auth/public/server';
import { canAccessRoute, type RouteAccess } from './route.access.ts';

function redirectToLogin(request: Request): Response {
  const url = new URL(request.url);
  const redirect = `${url.pathname}${url.search}${url.hash}`;
  return Response.redirect(new URL(`/login?redirect=${encodeURIComponent(redirect)}`, url), 302);
}

function forbidden(): Response {
  return new Response('Forbidden', { status: 403 });
}

function authUnavailable(): Response {
  return new Response('Authentication service unavailable', {
    status: 503,
    headers: { 'Retry-After': '5' },
  });
}

export function authorizeRequest(
  request: Request,
  access: RouteAccess,
  resolution: SessionResolution,
): Response | null {
  if (access.kind === 'public') return null;
  if (resolution.status === 'unauthenticated') return redirectToLogin(request);
  if (resolution.status === 'unavailable') return authUnavailable();

  const role = resolution.status === 'authenticated' ? resolution.session.role : undefined;
  return canAccessRoute(access, role) ? null : forbidden();
}
