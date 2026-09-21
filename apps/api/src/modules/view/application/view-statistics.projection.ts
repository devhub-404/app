import { Injectable } from '@nestjs/common';
import { ViewStatisticsRepository } from '@/modules/view/application/views/view-statistics.repository';

@Injectable()
export class ViewStatisticsProjection {
  constructor(private readonly statistics: ViewStatisticsRepository) {}
  getCounts(resourceIds: string[]) {
    return this.statistics.getCounts(resourceIds);
  }
  setCount(resourceId: string, count: number) {
    return this.statistics.setCount(resourceId, count);
  }
}
