import { defineMiddleware } from 'astro:middleware';
import { DEFAULT_LOCALE, localeFromAcceptLanguage } from '@/shared/i18n/core';
import { resolveSession } from '@/features/auth/public/server';
import { hasValidSessionCookie } from '@/shared/auth/session-cookie';
import { authorizeRequest } from './authorization.access.ts';
import { requiresRouteAuthentication, routeAccess } from './route.access.ts';

export const accessMiddleware = defineMiddleware(async (context, next) => {
  const access = routeAccess(context.url.pathname);
  const requiresSession = requiresRouteAuthentication(access);

  let sessionDurationMs = 0;
  const resolution = requiresSession
    ? await (async () => {
        const startedAt = performance.now();
        const result = await resolveSession(context.request);
        sessionDurationMs = performance.now() - startedAt;
        return result;
      })()
    : null;

  const accountResolution = requiresSession
    ? (resolution?.status ?? 'unavailable')
    : hasValidSessionCookie(context.request)
      ? 'deferred'
      : 'unauthenticated';

  context.locals.accountResolution = accountResolution;
  context.locals.account = resolution?.status === 'authenticated' ? resolution.session : null;
  context.locals.sessionDurationMs = sessionDurationMs;
  context.locals.sessionLookup = requiresSession ? 'required' : 'skipped';

  if (resolution?.status === 'authenticated') {
    context.locals.locale =
      resolution.session.preferences.locale ??
      localeFromAcceptLanguage(context.request.headers.get('accept-language')) ??
      DEFAULT_LOCALE;
  }

  if (requiresSession) {
    const denied = authorizeRequest(context.request, access, resolution ?? { status: 'unavailable' });
    if (denied) return denied;
  }

  return next();
});
