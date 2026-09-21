import type { NewsItem } from '@/features/news/types/news.dto.type.ts';

export type NewsLifecycleState = 'draft' | 'published' | 'archived';

export function isNewsPublic(news: Pick<NewsItem, 'status'>): boolean {
  return news.status === 'published';
}

export function isNewsPublishable(news: Pick<NewsItem, 'status'>): boolean {
  return news.status === 'draft';
}

export function isNewsArchivable(news: Pick<NewsItem, 'status'>): boolean {
  return news.status === 'published';
}

export function isNewsUnarchivable(news: Pick<NewsItem, 'status'>): boolean {
  return news.status === 'archived';
}
