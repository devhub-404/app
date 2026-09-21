export type ProjectSearchCriteria = {
  search?: string;
  authorAccountId?: string;
  tags?: string[];
  sort?: 'recent' | 'title';
  page?: number;
  pageSize?: number;
};
