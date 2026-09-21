export type ArticleSearchSort = 'votes' | 'views' | 'comments';

export type ArticleSearchCriteria = {
  search?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
  sort?: ArticleSearchSort;
  publishedAfter?: Date;
};
