import type { DiscoveryItem } from '@/features/discovery/types/discovery.type.ts';
import { routes } from '@/shared/navigation/routes';

export const feedItemHref = (item: DiscoveryItem) =>
  item.type === 'resource'
    ? item.slug
    : item.type === 'article'
      ? routes.article(item.slug)
      : item.type === 'question'
        ? routes.question(item.id)
        : item.type === 'project'
          ? routes.project(item.slug)
          : item.type === 'job'
            ? routes.job(item.id)
            : item.type === 'event'
              ? routes.event(item.slug)
              : routes.newsDetail(item.slug);

export const feedItemLabelKey = (type: DiscoveryItem['type']) =>
  (
    ({
      article: 'contentType.article',
      news: 'contentType.news',
      resource: 'contentType.resource',
      question: 'contentType.question',
      project: 'contentType.project',
      job: 'contentType.job',
      event: 'contentType.event',
    }) as const
  )[type];
