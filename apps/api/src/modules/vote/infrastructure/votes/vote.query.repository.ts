import { and, eq, gte, inArray, lte } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { resourceVotesSchema } from '@/shared/infrastructure/database/drizzle/schema/vote/resource-votes.schema';
import { VoteStatisticsRepository } from '@/modules/vote/application/ports/repositories/vote-statistics.repository';
import { VoteQueryRepository } from '@/modules/vote/application/ports/repositories/vote.query.repository';
import type { VoteDTO, SyncedVoteDTO } from '@/modules/vote/application/dtos/out';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';

@Injectable()
export class DrizzleVoteQueryRepository implements VoteQueryRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    private readonly statistics: VoteStatisticsRepository,
  ) {}

  async getVotes(accountId: string, resourceIds: string[]): Promise<VoteDTO[]> {
    if (!resourceIds.length) return [];

    return this.db
      .select({ resourceId: resourceVotesSchema.resourceId })
      .from(resourceVotesSchema)
      .where(
        and(
          eq(resourceVotesSchema.accountId, accountId),
          eq(resourceVotesSchema.active, true),
          inArray(resourceVotesSchema.resourceId, resourceIds),
        ),
      );
  }

  async syncVotes(accountId: string, syncedThrough: string, updatedAfter?: string): Promise<SyncedVoteDTO[]> {
    const filters = [eq(resourceVotesSchema.accountId, accountId), lte(resourceVotesSchema.updatedAt, syncedThrough)];
    if (updatedAfter) filters.push(gte(resourceVotesSchema.updatedAt, updatedAfter));

    return this.db
      .select({
        resourceId: resourceVotesSchema.resourceId,
        active: resourceVotesSchema.active,
        updatedAt: resourceVotesSchema.updatedAt,
      })
      .from(resourceVotesSchema)
      .where(and(...filters));
  }

  async getStats(resourceId: string): Promise<{ votes: number }> {
    return { votes: (await this.statistics.getCounts([resourceId]))[resourceId] ?? 0 };
  }

  async getStatsMany(resourceIds: string[]): Promise<Record<string, number>> {
    return this.statistics.getCounts([...new Set(resourceIds)]);
  }
}
