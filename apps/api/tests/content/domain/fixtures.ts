import { Article } from '@/modules/article/domain/article';
import { News } from '@/modules/news/domain/news';
import { ExternalResource } from '@/modules/external-resource/domain/external-resource';

export function article(overrides: Partial<Parameters<typeof Article.create>[1]> = {}) {
  return Article.create('article-1', {
    authorId: 'user-1',
    title: 'Article',
    slug: 'article',
    description: 'Article description',
    content: 'Content',
    ...overrides,
  });
}

export function news(overrides: Partial<Parameters<typeof News.create>[1]> = {}) {
  return News.create('news-1', {
    createdByAccountId: 'user-1',
    title: 'News',
    slug: 'news',
    description: 'News description',
    summary: 'Summary',
    content: 'Content',
    occurredAt: '2026-08-18T10:00:00.000Z',
    ...overrides,
  });
}

export function resource(overrides: Partial<Parameters<typeof ExternalResource.create>[1]> = {}) {
  return ExternalResource.create('resource-1', {
    title: 'Resource',
    description: 'Description',
    url: 'https://example.com/resource',
    ...overrides,
  });
}
