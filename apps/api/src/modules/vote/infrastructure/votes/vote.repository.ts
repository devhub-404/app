import { and, count, eq } from 'drizzle-orm';
import { resourceVotesSchema } from '@/shared/infrastructure/database/drizzle/schema/vote/resource-votes.schema';
import { Inject, Injectable } from '@nestjs/common';
import { VoteRepository } from '@/modules/vote/application/ports/repositories/vote.repository';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { VoteStatisticsRepository } from '@/modules/vote/application/ports/repositories/vote-statistics.repository';

@Injectable()
export class DrizzleVoteRepository implements VoteRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    private readonly statistics: VoteStatisticsRepository,
  ) {}

  async setVote(accountId: string, resourceId: string): Promise<void> {
    await this.db
      .insert(resourceVotesSchema)
      .values({ accountId, resourceId, active: true })
      .onConflictDoUpdate({
        target: [resourceVotesSchema.accountId, resourceVotesSchema.resourceId],
        set: { active: true, updatedAt: new Date().toISOString() },
      });
    await this.syncVoteCount(String(resourceId));
  }

  async removeVote(accountId: string, resourceId: string): Promise<void> {
    await this.db
      .update(resourceVotesSchema)
      .set({ active: false, updatedAt: new Date().toISOString() })
      .where(and(eq(resourceVotesSchema.accountId, accountId), eq(resourceVotesSchema.resourceId, resourceId)));
    await this.syncVoteCount(String(resourceId));
  }

  async deleteByResourceId(resourceId: string): Promise<number> {
    const rows = await this.db
      .delete(resourceVotesSchema)
      .where(eq(resourceVotesSchema.resourceId, resourceId))
      .returning({ accountId: resourceVotesSchema.accountId });
    await this.statistics.setCount(resourceId, 0);

    return rows.length;
  }

  async deleteByAccountId(accountId: string): Promise<number> {
    const targets = await this.db
      .select({ resourceId: resourceVotesSchema.resourceId })
      .from(resourceVotesSchema)
      .where(eq(resourceVotesSchema.accountId, accountId));
    const rows = await this.db
      .delete(resourceVotesSchema)
      .where(eq(resourceVotesSchema.accountId, accountId))
      .returning({ accountId: resourceVotesSchema.accountId });
    for (const resourceId of [...new Set(targets.map((target) => target.resourceId))])
      await this.syncVoteCount(String(resourceId));

    return rows.length;
  }

  private async syncVoteCount(resourceId: string): Promise<void> {
    const [row] = await this.db
      .select({ count: count() })
      .from(resourceVotesSchema)
      .where(and(eq(resourceVotesSchema.resourceId, resourceId), eq(resourceVotesSchema.active, true)));
    await this.statistics.setCount(resourceId, Number(row?.count ?? 0));
  }
}
