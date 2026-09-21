import { defineMiddleware } from 'astro:middleware';
import { createSsrApiClient } from '@/shared/api/ssr-client.api.ts';
import { localeFromRequest } from '@/shared/i18n/core';

export const bootstrapMiddleware = defineMiddleware((context, next) => {
  context.locals.api = createSsrApiClient(context.request);
  context.locals.locale = localeFromRequest(context.request);
  return next();
});
