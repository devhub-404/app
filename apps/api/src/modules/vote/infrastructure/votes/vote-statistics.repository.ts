import { Inject, Injectable } from '@nestjs/common';
import { inArray } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { voteStatisticsSchema } from '@/shared/infrastructure/database/drizzle/schema/vote/vote-statistics.schema';
import { VoteStatisticsRepository } from '@/modules/vote/application/ports/repositories/vote-statistics.repository';

@Injectable()
export class DrizzleVoteStatisticsRepository implements VoteStatisticsRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async getCounts(resourceIds: string[]): Promise<Record<string, number>> {
    const ids = [...new Set(resourceIds)];
    if (!ids.length) return {};
    const rows = await this.db
      .select({ resourceId: voteStatisticsSchema.resourceId, total: voteStatisticsSchema.voteCount })
      .from(voteStatisticsSchema)
      .where(inArray(voteStatisticsSchema.resourceId, ids));

    return Object.fromEntries(rows.map((row) => [row.resourceId, Number(row.total)]));
  }

  async setCount(resourceId: string, voteCount: number): Promise<void> {
    await this.db
      .insert(voteStatisticsSchema)
      .values({ resourceId, voteCount })
      .onConflictDoUpdate({ target: voteStatisticsSchema.resourceId, set: { voteCount } });
  }
}
