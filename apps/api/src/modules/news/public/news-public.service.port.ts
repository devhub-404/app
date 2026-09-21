export type NewsAccessSnapshot = { isPublic: boolean; commentsEnabled: boolean };

export abstract class NewsPublicServicePort {
  abstract resolveAccess(newsId: string): Promise<NewsAccessSnapshot | null>;
  abstract applyEditorialAction(newsId: string, action: 'archive' | 'delete'): Promise<void>;
}

export const NEWS_PUBLIC_SERVICE = 'NEWS_PUBLIC_SERVICE';
