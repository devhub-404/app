import { defineMiddleware } from 'astro:middleware';
import { finalizeResponse } from './response';

export const responseMiddleware = defineMiddleware(async (context, next) => {
  const renderStartedAt = performance.now();
  let response: Response;
  try {
    response = await next();
  } catch {
    response = await context.rewrite('/500');
  }
  const renderDurationMs = performance.now() - renderStartedAt;
  const timing = [
    context.locals.sessionDurationMs === undefined
      ? null
      : `session;dur=${context.locals.sessionDurationMs.toFixed(1)};desc="${context.locals.sessionLookup}"`,
    `astro;dur=${renderDurationMs.toFixed(1)};desc="middleware response setup"`,
  ]
    .filter(Boolean)
    .join(', ');

  return finalizeResponse(response, context.request, timing);
});
