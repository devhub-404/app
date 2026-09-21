import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { CommentRepository } from '@/modules/comment/application/comments/ports/repositories/comment.repository';
import { CommentsPolicy } from '@/modules/comment/application/comments/comments.policy';
import type { User } from '@/shared/kernel/auth/authenticated-user';

@Injectable()
export class UnhideCommentCommand {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly commentsPolicy: CommentsPolicy,
  ) {}

  async execute(user: User, commentId: string): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new AppError('CONTENT_COMMENT_NOT_FOUND');

    this.commentsPolicy.canModerateComment(user);
    const expectedHiddenAt = comment.hiddenAt;
    comment.unhide();
    const saved = await this.commentRepository.updateVisibility(comment, expectedHiddenAt);
    if (!saved) throw new AppError('CONTENT_UPDATE_CONFLICT');
  }
}
