import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { CommentRepository } from '@/modules/comment/application/comments/ports/repositories/comment.repository';
import { CommentModerationPort, type CommentModerationTarget } from './comment-moderation.port';

@Injectable()
export class CommentModerationService implements CommentModerationPort {
  constructor(private readonly comments: CommentRepository) {}

  async resolve(id: string): Promise<CommentModerationTarget | null> {
    const comment = await this.comments.findById(id);
    if (!comment || comment.isDeleted || !comment.authorAccountId || comment.content === null) return null;

    return {
      id: comment.id,
      authorId: comment.authorAccountId,
      content: comment.content,
      createdAt: comment.createdAt,
      hiddenAt: comment.hiddenAt,
    };
  }

  async apply(id: string, action: 'hide_comment' | 'unhide_comment'): Promise<void> {
    const comment = await this.comments.findById(id);
    if (!comment || comment.isDeleted) throw new AppError('CONTENT_COMMENT_NOT_FOUND');
    const expectedHiddenAt = comment.hiddenAt;
    if (action === 'hide_comment') {
      if (comment.hiddenAt) return;
      comment.hide();
    } else {
      if (!comment.hiddenAt) return;
      comment.unhide();
    }
    const saved = await this.comments.updateVisibility(comment, expectedHiddenAt);
    if (!saved) throw new AppError('CONTENT_UPDATE_CONFLICT');
  }

  listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>> {
    return this.comments.listHiddenForModeration();
  }
}
