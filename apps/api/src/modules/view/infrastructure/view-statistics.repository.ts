import { Inject, Injectable } from '@nestjs/common';
import { inArray } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { viewStatisticsSchema } from '@/shared/infrastructure/database/drizzle/schema/view/view-statistics.schema';
import { ViewStatisticsRepository } from '@/modules/view/application/views/view-statistics.repository';

@Injectable()
export class DrizzleViewStatisticsRepository implements ViewStatisticsRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async getCounts(resourceIds: string[]): Promise<Record<string, number>> {
    const ids = [...new Set(resourceIds)];
    if (!ids.length) return {};
    const rows = await this.db
      .select({ resourceId: viewStatisticsSchema.resourceId, total: viewStatisticsSchema.viewCount })
      .from(viewStatisticsSchema)
      .where(inArray(viewStatisticsSchema.resourceId, ids));

    return Object.fromEntries(rows.map((row) => [row.resourceId, Number(row.total)]));
  }

  async setCount(resourceId: string, viewCount: number): Promise<void> {
    await this.db
      .insert(viewStatisticsSchema)
      .values({ resourceId, viewCount })
      .onConflictDoUpdate({ target: viewStatisticsSchema.resourceId, set: { viewCount } });
  }
}
