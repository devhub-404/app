import { Inject, Injectable } from '@nestjs/common';
import { inArray } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { commentStatisticsSchema } from '@/shared/infrastructure/database/drizzle/schema/comment/comment-statistics.schema';
import { CommentStatisticsRepository } from '@/modules/comment/application/comments/ports/repositories/comment-statistics.repository';

@Injectable()
export class DrizzleCommentStatisticsRepository implements CommentStatisticsRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async getCounts(resourceIds: string[]): Promise<Record<string, number>> {
    const ids = [...new Set(resourceIds)];
    if (!ids.length) return {};
    const rows = await this.db
      .select({ resourceId: commentStatisticsSchema.resourceId, total: commentStatisticsSchema.commentCount })
      .from(commentStatisticsSchema)
      .where(inArray(commentStatisticsSchema.resourceId, ids));

    return Object.fromEntries(rows.map((row) => [row.resourceId, Number(row.total)]));
  }

  async setCount(resourceId: string, commentCount: number): Promise<void> {
    await this.db
      .insert(commentStatisticsSchema)
      .values({ resourceId, commentCount })
      .onConflictDoUpdate({ target: commentStatisticsSchema.resourceId, set: { commentCount } });
  }
}
