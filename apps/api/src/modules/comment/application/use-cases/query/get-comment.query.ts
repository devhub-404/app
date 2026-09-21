import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import type { CommentDTO } from '@/modules/comment/application/comments/dtos/out';
import { CommentQueryRepository } from '@/modules/comment/application/comments/ports/repositories/comment.query.repository';

@Injectable()
export class GetCommentQuery {
  constructor(private readonly commentQueryRepository: CommentQueryRepository) {}

  async execute(commentId: string): Promise<CommentDTO> {
    const comment = await this.commentQueryRepository.findById(commentId);
    if (!comment) throw new AppError('CONTENT_COMMENT_NOT_FOUND');

    return comment;
  }
}
