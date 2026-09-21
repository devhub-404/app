import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { Comment } from '@/modules/comment/domain/comment';
import { CommentRepository } from '@/modules/comment/application/comments/ports/repositories/comment.repository';
import { CreateCommentDTO } from '@/modules/comment/application/comments/dtos/in';
import { CommentQueryRepository } from '@/modules/comment/application/comments/ports/repositories/comment.query.repository';
import { CommentCreatedDTO } from '@/modules/comment/application/comments/dtos/out';
import { ModerationAccountRestrictionPort } from '@/modules/moderation/public/account-restriction.port';
import { NotificationPublicService } from '@/modules/notification/public/notification-public.service';
import { CommentTargetAccessService } from '@/modules/comment/application/comments/comment-target-access.service';

@Injectable()
export class CreateCommentCommand {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly commentQueryRepository: CommentQueryRepository,
    private readonly targetAccess: CommentTargetAccessService,
    private readonly notifications: NotificationPublicService,
    private readonly accountRestrictionService: ModerationAccountRestrictionPort,
  ) {}

  async execute(userId: string, resourceId: string, payload: CreateCommentDTO): Promise<CommentCreatedDTO> {
    await this.accountRestrictionService.assertAccountCapability(userId, 'COMMENT');
    const target = await this.targetAccess.resolve(resourceId);
    if (!target?.isCommentable) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

    if (payload.parentId) {
      const parent = await this.commentRepository.findById(payload.parentId);
      if (!parent || parent.resourceId !== resourceId) throw new AppError('CONTENT_COMMENT_INVALID_PARENT');
    }

    const comment = Comment.create('__new__', {
      resourceId,
      authorAccountId: userId,
      parentId: payload.parentId ?? null,
      content: payload.content,
    });
    const commentId = await this.commentRepository.create(comment);
    const createdComment = await this.commentQueryRepository.findById(commentId);
    if (!createdComment) throw new AppError('CONTENT_COMMENT_NOT_FOUND');

    if (target.kind === 'article' && target.ownerAccountId && target.ownerAccountId !== userId) {
      await this.notifications.notify({
        accountId: target.ownerAccountId,
        type: 'article_commented',
        sourceType: 'comment',
        sourceId: commentId,
        targetType: 'article',
        targetId: resourceId,
      });
    }

    return createdComment;
  }
}
