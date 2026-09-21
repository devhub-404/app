import type { ContentPublishedMessage } from '@/shared/kernel/events/published-content';

export const ARTICLE_PUBLISHED_EVENT = 'content.article.published';

export class ArticlePublishedEvent {
  constructor(readonly message: ContentPublishedMessage) {}
}
