export type NewsListingSort = 'recent' | 'oldest';
export type NewsListingPeriod = 'all' | 'day' | 'week' | 'month' | 'year';

export type NewsListingFilters = {
  query: string;
  tags: string[];
  sort: NewsListingSort;
  period: NewsListingPeriod;
  page: number;
};

export type NewsListingQuery = {
  query?: string;
  tags?: string[];
  sort?: Exclude<NewsListingSort, 'recent'>;
  period?: Exclude<NewsListingPeriod, 'all'>;
  page: number;
  pageSize: number;
};

export const toNewsQuery = (filters: NewsListingFilters, pageSize: number): NewsListingQuery => ({
  query: filters.query || undefined,
  tags: filters.tags,
  sort: filters.sort === 'recent' ? undefined : filters.sort,
  period: filters.period === 'all' ? undefined : filters.period,
  page: filters.page,
  pageSize,
});
