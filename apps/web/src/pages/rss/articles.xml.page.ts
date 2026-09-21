import type { APIRoute } from 'astro';
import { renderRssFeed } from '@/shared/rss/server/rss-feed';
import { localeFromRequest } from '@/shared/i18n/core';
import { listArticlesQuery, translate } from '@/features/article/public';

export const GET: APIRoute = async ({ request, url }) => {
  const locale = localeFromRequest(request);
  try {
    const xml = await renderRssFeed({
      path: 'articles',
      title: translate(locale, 'rss.title'),
      description: translate(locale, 'rss.description'),
      itemPath: 'articles',
      origin: url.origin,
      loadPage: (page, pageSize) => listArticlesQuery({ page, pageSize, period: 'all' }),
    });
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=900',
        Vary: 'Accept-Language',
      },
    });
  } catch {
    return new Response(translate(locale, 'rss.unavailable'), { status: 503, headers: { Vary: 'Accept-Language' } });
  }
};
