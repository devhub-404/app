import type { TagDTO } from '@/modules/taxonomy/application/tag/dtos/out';
import type { TagSearchCriteria } from './tag-search.criteria';
import { Paginated } from '@/shared/kernel/pagination';

export abstract class TagQueryRepository {
  abstract findBySlug(slug: string): Promise<TagDTO | null>;
  abstract findByName(name: string): Promise<TagDTO | null>;
  abstract findById(id: string): Promise<TagDTO | null>;
  abstract search(query: TagSearchCriteria): Promise<TagDTO[]>;
  abstract searchPage(query: TagSearchCriteria): Promise<Paginated<TagDTO>>;
  abstract existsBySlug(slug: string): Promise<boolean>;
}
