import type { QueryTagDTO } from '@/modules/taxonomy/application/tag/dtos/in';
import type { TagSearchCriteria } from '@/modules/taxonomy/application/tag/ports/tag-search.criteria';

export function toTagSearchCriteria(query: QueryTagDTO): TagSearchCriteria {
  return {
    ...(query.search !== undefined ? { search: query.search } : {}),
    ...(query.slug !== undefined ? { slug: query.slug } : {}),
    ...(query.page !== undefined ? { page: query.page } : {}),
    ...(query.pageSize !== undefined ? { pageSize: query.pageSize } : {}),
  };
}
