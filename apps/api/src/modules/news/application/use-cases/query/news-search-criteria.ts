import { QueryNewsDTO } from '@/modules/news/application/dtos/in';
import type { NewsSearchCriteria } from '@/modules/news/application/ports/repositories/news-search.criteria';
import { resolvePeriodLowerBound } from '@/shared/kernel/time/period';

export function toNewsSearchCriteria(query: QueryNewsDTO): NewsSearchCriteria {
  const criteria: NewsSearchCriteria = {};
  const tags = query.tags
    ?.split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const publishedAfter = resolvePeriodLowerBound(query.period);

  if (query.search) criteria.search = query.search;
  if (tags?.length) criteria.tags = tags;
  if (query.source) criteria.sourceDomain = query.source.trim();
  if (query.page !== undefined) criteria.page = query.page;
  if (query.pageSize !== undefined) criteria.pageSize = query.pageSize;
  if (query.sort !== undefined) criteria.sort = query.sort;
  if (publishedAfter) criteria.publishedAfter = publishedAfter;

  return criteria;
}
