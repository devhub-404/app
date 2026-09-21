import { Injectable } from '@nestjs/common';
import { CommentStatisticsRepository } from '@/modules/comment/application/comments/ports/repositories/comment-statistics.repository';

/** Semantic projection facade for comment counters. */
@Injectable()
export class CommentStatisticsProjection {
  constructor(private readonly statistics: CommentStatisticsRepository) {}
  getCounts(resourceIds: string[]) {
    return this.statistics.getCounts(resourceIds);
  }
  setCount(resourceId: string, count: number) {
    return this.statistics.setCount(resourceId, count);
  }
}
