import type { ListCommentsQueryDTO } from '@/modules/comment/application/comments/dtos/in/list-comments-query.dto';
import type { CommentSearchCriteria } from '@/modules/comment/application/comments/ports/repositories/comment-search.criteria';

export function toCommentSearchCriteria(query: ListCommentsQueryDTO): CommentSearchCriteria {
  return {
    ...(query.hidden !== undefined ? { hidden: query.hidden } : {}),
    ...(query.page !== undefined ? { page: query.page } : {}),
    ...(query.pageSize !== undefined ? { pageSize: query.pageSize } : {}),
  };
}
