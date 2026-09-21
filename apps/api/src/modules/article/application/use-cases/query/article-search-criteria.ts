import { QueryArticleDTO } from '@/modules/article/application/dtos/in';
import type { ArticleSearchCriteria } from '@/modules/article/application/ports/repositories/article-search.criteria';
import { resolvePeriodLowerBound } from '@/shared/kernel/time/period';

export function toArticleSearchCriteria(query: QueryArticleDTO): ArticleSearchCriteria {
  const criteria: ArticleSearchCriteria = {};
  const tags = query.tags
    ?.split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const publishedAfter = resolvePeriodLowerBound(query.period);

  if (query.search) criteria.search = query.search;
  if (tags?.length) criteria.tags = tags;
  if (query.page !== undefined) criteria.page = query.page;
  if (query.pageSize !== undefined) criteria.pageSize = query.pageSize;
  if (query.sort !== undefined) criteria.sort = query.sort;
  if (publishedAfter) criteria.publishedAfter = publishedAfter;

  return criteria;
}
