import { QueryResourceDTO } from '@/modules/external-resource/application/dtos/in';
import type { ResourceSearchCriteria } from '@/modules/external-resource/application/ports/repositories/resource-search.criteria';

export function toResourceSearchCriteria(query: QueryResourceDTO): ResourceSearchCriteria {
  const criteria: ResourceSearchCriteria = {};
  const tags = query.tags
    ?.split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (query.search) criteria.search = query.search;
  if (tags?.length) criteria.tags = tags;
  if (query.page !== undefined) criteria.page = query.page;
  if (query.pageSize !== undefined) criteria.pageSize = query.pageSize;
  if (query.sort !== undefined) criteria.sort = query.sort;

  return criteria;
}
