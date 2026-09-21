import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { CommentRepository } from '@/modules/comment/application/comments/ports/repositories/comment.repository';
import { UpdateCommentDTO } from '@/modules/comment/application/comments/dtos/in';
import { CommentsPolicy } from '@/modules/comment/application/comments/comments.policy';
import type { User } from '@/shared/kernel/auth/authenticated-user';

@Injectable()
export class UpdateCommentCommand {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly commentsPolicy: CommentsPolicy,
  ) {}

  async execute(user: User, commentId: string, payload: UpdateCommentDTO): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);

    if (!comment || comment.isDeleted || !comment.authorAccountId) {
      throw new AppError('CONTENT_COMMENT_NOT_FOUND');
    }

    this.commentsPolicy.canUpdateComment(user, comment.authorAccountId);

    comment.update({ content: payload.content });
    await this.commentRepository.updateContent(comment);
  }
}
