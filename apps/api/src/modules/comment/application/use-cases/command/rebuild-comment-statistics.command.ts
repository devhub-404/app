import { Injectable } from '@nestjs/common';
import { CommentRepository } from '@/modules/comment/application/comments/ports/repositories/comment.repository';

@Injectable()
export class RebuildCommentStatisticsCommand {
  constructor(private readonly commentRepository: CommentRepository) {}

  execute(): Promise<void> {
    return this.commentRepository.rebuildStatistics();
  }
}
