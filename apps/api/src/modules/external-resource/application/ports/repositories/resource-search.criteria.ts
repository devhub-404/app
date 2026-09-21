export type ResourceSearchSort = 'votes';

export type ResourceSearchCriteria = {
  search?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
  sort?: ResourceSearchSort;
};
