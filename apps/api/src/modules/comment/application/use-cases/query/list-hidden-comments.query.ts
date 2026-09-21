import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import type { CommentDTO } from '@/modules/comment/application/comments/dtos/out';
import { CommentQueryRepository } from '@/modules/comment/application/comments/ports/repositories/comment.query.repository';
import { CommentTargetAccessService } from '@/modules/comment/application/comments/comment-target-access.service';

@Injectable()
export class ListHiddenCommentsQuery {
  constructor(
    private readonly commentQueryRepository: CommentQueryRepository,
    private readonly targetAccess: CommentTargetAccessService,
  ) {}

  async execute(resourceId: string): Promise<CommentDTO[]> {
    if (!(await this.targetAccess.resolve(resourceId))) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

    return this.commentQueryRepository.findHiddenByResourceId(resourceId);
  }
}
