import { Injectable } from '@nestjs/common';
import type { CommentDTO } from '@/modules/comment/application/comments/dtos/out';
import { CommentQueryRepository } from '@/modules/comment/application/comments/ports/repositories/comment.query.repository';
import type { ListCommentsQueryDTO } from '@/modules/comment/application/comments/dtos/in/list-comments-query.dto';
import type { Paginated } from '@/shared/kernel/pagination';
import { toCommentSearchCriteria } from './comment-search-criteria';

@Injectable()
export class ListMyCommentsQuery {
  constructor(private readonly commentQueryRepository: CommentQueryRepository) {}

  execute(userId: string, query: ListCommentsQueryDTO): Promise<Paginated<CommentDTO>> {
    return this.commentQueryRepository.findByAuthorId(userId, toCommentSearchCriteria(query));
  }
}
