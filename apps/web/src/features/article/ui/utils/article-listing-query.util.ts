import { parseListingSearch } from '@/shared/ui/schemas/search.schema.ts';
import { articleSearchSchema } from '@/features/article/ui/schemas/search.schema.ts';

export type ArticleListingSort = 'recent' | 'votes' | 'views' | 'comments';
export type ArticleListingPeriod = 'all' | 'day' | 'week' | 'month' | 'year';
export type ArticleListingView = 'grid' | 'list';

export type ArticleListingFilters = {
  query: string;
  tags: string[];
  sort: ArticleListingSort;
  period: ArticleListingPeriod;
  page: number;
};

export type ArticleListingQuery = {
  query?: string;
  tags?: string[];
  sort?: Exclude<ArticleListingSort, 'recent'>;
  period?: Exclude<ArticleListingPeriod, 'all'>;
  page: number;
  pageSize: number;
};

export const toArticleQuery = (filters: ArticleListingFilters, pageSize: number): ArticleListingQuery => ({
  query: filters.query || undefined,
  tags: filters.tags,
  sort: filters.sort === 'recent' ? undefined : filters.sort,
  period: filters.period === 'all' ? undefined : filters.period,
  page: filters.page,
  pageSize,
});

export const parseArticleListingUrl = (url: URL): ArticleListingFilters => {
  const base = parseListingSearch(url.searchParams);
  const parsed = articleSearchSchema.parse({ ...base, sort: url.searchParams.get('sort'), period: url.searchParams.get('period') });

  return {
    query: base.query,
    tags: base.tags,
    sort: parsed.sort,
    period: parsed.period,
    page: base.page,
  };
};
