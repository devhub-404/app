export type QAndASearchCriteria = {
  search?: string;
  status?: 'open' | 'closed' | 'solved';
  tags?: string[];
  sort?: 'recent' | 'answers';
  page?: number;
  pageSize?: number;
};
