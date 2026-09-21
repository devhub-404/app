export type NewsSearchSort = 'recent' | 'oldest' | 'views';

export type NewsSearchCriteria = {
  search?: string;
  tags?: string[];
  sourceDomain?: string;
  page?: number;
  pageSize?: number;
  sort?: NewsSearchSort;
  publishedAfter?: Date;
};
