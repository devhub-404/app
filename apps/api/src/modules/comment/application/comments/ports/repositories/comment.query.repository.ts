import { CommentDTO } from '@/modules/comment/application/comments/dtos/out';
import type { CommentSearchCriteria } from './comment-search.criteria';
import type { Paginated } from '@/shared/kernel/pagination';

export abstract class CommentQueryRepository {
  abstract findById(id: string): Promise<CommentDTO | null>;
  abstract findByResourceId(resourceId: string): Promise<CommentDTO[]>;
  abstract findHiddenByResourceId(resourceId: string): Promise<CommentDTO[]>;
  abstract findByAuthorId(authorAccountId: string, query: CommentSearchCriteria): Promise<Paginated<CommentDTO>>;
  abstract findAll(query: CommentSearchCriteria): Promise<Paginated<CommentDTO>>;
}
