import { and, count, eq } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { ViewRepository } from '@/modules/view/application/views/view.repository';
import type { ViewRecord } from '@/modules/view/application/views/view.types';
import { resourceViewsSchema } from '@/shared/infrastructure/database/drizzle/schema/view/resource-views.schema';
import { ViewStatisticsRepository } from '@/modules/view/application/views/view-statistics.repository';

@Injectable()
export class DrizzleViewRepository implements ViewRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    private readonly statistics: ViewStatisticsRepository,
  ) {}

  async record(accountId: string, resourceId: string): Promise<ViewRecord> {
    const [row] = await this.db
      .insert(resourceViewsSchema)
      .values({ accountId, resourceId })
      .onConflictDoNothing({ target: [resourceViewsSchema.accountId, resourceViewsSchema.resourceId] })
      .returning();

    await this.syncViewCount(String(resourceId));
    if (row) return row;

    const [existing] = await this.db
      .select()
      .from(resourceViewsSchema)
      .where(and(eq(resourceViewsSchema.accountId, accountId), eq(resourceViewsSchema.resourceId, resourceId)));
    if (!existing) throw new Error('VIEW_NOT_PERSISTED');

    return existing;
  }

  async count(resourceId: string): Promise<number> {
    return Number((await this.statistics.getCounts([resourceId]))[resourceId] ?? 0);
  }

  countMany(resourceIds: string[]): Promise<Record<string, number>> {
    if (!resourceIds.length) return Promise.resolve({});

    return this.statistics.getCounts(resourceIds);
  }

  async deleteByAccountId(accountId: string): Promise<number> {
    const targets = await this.db
      .select({ resourceId: resourceViewsSchema.resourceId })
      .from(resourceViewsSchema)
      .where(eq(resourceViewsSchema.accountId, accountId));
    const rows = await this.db
      .delete(resourceViewsSchema)
      .where(eq(resourceViewsSchema.accountId, accountId))
      .returning({ accountId: resourceViewsSchema.accountId });
    for (const resourceId of [...new Set(targets.map((row) => row.resourceId))])
      await this.syncViewCount(String(resourceId));

    return rows.length;
  }

  async deleteByResourceId(resourceId: string): Promise<number> {
    const rows = await this.db
      .delete(resourceViewsSchema)
      .where(eq(resourceViewsSchema.resourceId, resourceId))
      .returning({ accountId: resourceViewsSchema.accountId });
    await this.statistics.setCount(resourceId, 0);

    return rows.length;
  }

  private async syncViewCount(resourceId: string): Promise<void> {
    const [row] = await this.db
      .select({ count: count() })
      .from(resourceViewsSchema)
      .where(eq(resourceViewsSchema.resourceId, resourceId));
    await this.statistics.setCount(resourceId, Number(row?.count ?? 0));
  }
}
