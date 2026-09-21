export abstract class VoteStatisticsRepository {
  abstract getCounts(resourceIds: string[]): Promise<Record<string, number>>;
  abstract setCount(resourceId: string, voteCount: number): Promise<void>;
}
