export abstract class CommentStatisticsRepository {
  abstract getCounts(resourceIds: string[]): Promise<Record<string, number>>;
  abstract setCount(resourceId: string, commentCount: number): Promise<void>;
}
