import type { News } from '@/modules/news/domain/news';
import type { ResourceClassification } from '@/modules/taxonomy/public';

export abstract class NewsRepository {
  abstract transaction<T>(work: (context: unknown) => Promise<T>): Promise<T>;
  abstract findById(id: string, context?: unknown): Promise<News | null>;
  abstract slugExists(slug: string, excludeId?: string, context?: unknown): Promise<boolean>;
  abstract create(news: News, classification?: ResourceClassification, context?: unknown): Promise<string>;
  abstract save(news: News, classification?: ResourceClassification, expectedContentVersion?: number): Promise<boolean>;
  abstract delete(id: string): Promise<void>;
}
