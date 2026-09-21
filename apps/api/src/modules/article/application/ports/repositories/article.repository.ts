import type { Article } from '@/modules/article/domain/article';
import type { ResourceClassification } from '@/modules/taxonomy/public';

export abstract class ArticleRepository {
  abstract transaction<T>(work: (context: unknown) => Promise<T>): Promise<T>;
  abstract findById(id: string): Promise<Article | null>;
  abstract slugExists(slug: string, excludeId?: string): Promise<boolean>;
  abstract create(article: Article, classification?: ResourceClassification, context?: unknown): Promise<string>;
  abstract save(
    article: Article,
    classification?: ResourceClassification,
    expectedContentVersion?: number,
  ): Promise<boolean>;
  abstract delete(id: string): Promise<void>;
}
