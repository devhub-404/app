export abstract class ViewStatisticsRepository {
  abstract getCounts(resourceIds: string[]): Promise<Record<string, number>>;
  abstract setCount(resourceId: string, viewCount: number): Promise<void>;
}
