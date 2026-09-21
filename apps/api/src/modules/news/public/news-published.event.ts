import type { ContentPublishedMessage } from '@/shared/kernel/events/published-content';

export const NEWS_PUBLISHED_EVENT = 'content.news.published';

export class NewsPublishedEvent {
  constructor(readonly message: ContentPublishedMessage) {}
}
