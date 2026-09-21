import type { ListJobsDTO } from '../../dtos';
import type { JobSearchCriteria } from '../../ports/repositories/job-search.criteria';

export function toJobSearchCriteria(query: ListJobsDTO): JobSearchCriteria {
  const criteria: JobSearchCriteria = { page: query.page, pageSize: query.pageSize };
  const search = query.search?.trim();
  if (search) criteria.search = search;
  if (query.publisherOrganizationId) criteria.publisherOrganizationId = query.publisherOrganizationId;
  if (query.employmentType) criteria.employmentType = query.employmentType;
  if (query.workplaceType) criteria.workplaceType = query.workplaceType;
  const location = query.location?.trim();
  if (location) criteria.location = location;
  if (query.minComp !== undefined) criteria.minComp = query.minComp;
  const tags = query.tags
    ?.split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (tags?.length) criteria.tags = tags;
  if (query.sort) criteria.sort = query.sort;

  return criteria;
}
