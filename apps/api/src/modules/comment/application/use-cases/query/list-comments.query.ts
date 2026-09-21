import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import type { CommentDTO } from '@/modules/comment/application/comments/dtos/out';
import { CommentQueryRepository } from '@/modules/comment/application/comments/ports/repositories/comment.query.repository';
import { CommentTargetAccessService } from '@/modules/comment/application/comments/comment-target-access.service';

@Injectable()
export class ListCommentsQuery {
  constructor(
    private readonly commentQueryRepository: CommentQueryRepository,
    private readonly targetAccess: CommentTargetAccessService,
  ) {}

  async execute(resourceId: string): Promise<CommentDTO[]> {
    const target = await this.targetAccess.resolve(resourceId);
    if (!target?.isReadable) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

    const comments = await this.commentQueryRepository.findByResourceId(resourceId);
    const byParent = new Map<string | null, CommentDTO[]>();
    const publicIds = new Set(comments.map((comment) => comment.id));
    for (const comment of comments) {
      const publicParentId = comment.parentId && publicIds.has(comment.parentId) ? comment.parentId : null;
      const siblings = byParent.get(publicParentId) ?? [];
      siblings.push({ ...comment, children: [] });
      byParent.set(publicParentId, siblings);
    }
    const attachChildren = (comment: CommentDTO): CommentDTO => ({
      ...comment,
      children: (byParent.get(comment.id) ?? []).map(attachChildren),
    });

    return (byParent.get(null) ?? []).map(attachChildren);
  }
}
