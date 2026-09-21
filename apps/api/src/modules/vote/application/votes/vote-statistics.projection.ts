import { Injectable } from '@nestjs/common';
import { VoteStatisticsRepository } from '@/modules/vote/application/ports/repositories/vote-statistics.repository';

@Injectable()
export class VoteStatisticsProjection {
  constructor(private readonly statistics: VoteStatisticsRepository) {}
  getCounts(resourceIds: string[]) {
    return this.statistics.getCounts(resourceIds);
  }
  setCount(resourceId: string, count: number) {
    return this.statistics.setCount(resourceId, count);
  }
}
