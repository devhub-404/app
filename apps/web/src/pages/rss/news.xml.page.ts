import type { APIRoute } from 'astro';
import { renderRssFeed } from '@/shared/rss/server/rss-feed';
import { localeFromRequest } from '@/shared/i18n/core';
import { listNews, translate } from '@/features/news/public';

export const GET: APIRoute = async ({ request, url }) => {
  const locale = localeFromRequest(request);
  try {
    const xml = await renderRssFeed({
      path: 'news',
      title: translate(locale, 'rss.title'),
      description: translate(locale, 'rss.description'),
      itemPath: 'news',
      origin: url.origin,
      loadPage: (page, pageSize) => listNews({ page, pageSize, period: 'all' }),
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
