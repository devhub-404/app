import type { ListProjectsDTO } from '../../dtos';
import type { ProjectSearchCriteria } from '../../ports/repositories/project-search.criteria';

export function toProjectSearchCriteria(query: ListProjectsDTO): ProjectSearchCriteria {
  const criteria: ProjectSearchCriteria = { page: query.page, pageSize: query.pageSize };
  const search = query.search?.trim();
  if (search) criteria.search = search;
  if (query.authorAccountId) criteria.authorAccountId = query.authorAccountId;
  const tags = query.tags
    ?.split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (tags?.length) criteria.tags = tags;
  if (query.sort) criteria.sort = query.sort;

  return criteria;
}
