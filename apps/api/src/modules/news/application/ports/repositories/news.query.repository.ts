import { NewsDTO, NewsItemDTO, NewsSourceDTO } from '@/modules/news/application/dtos/out';
import { Paginated } from '@/shared/kernel/pagination';
import type { NewsSearchCriteria } from './news-search.criteria';

export abstract class NewsQueryRepository {
  abstract findById(id: string): Promise<NewsDTO | null>;
  abstract findBySlug(slug: string): Promise<NewsDTO | null>;
  abstract search(filter: NewsSearchCriteria): Promise<Paginated<NewsItemDTO>>;
  abstract searchForManagement(filter: NewsSearchCriteria): Promise<Paginated<NewsItemDTO>>;
  abstract listPopularSources(limit?: number): Promise<NewsSourceDTO[]>;
}
