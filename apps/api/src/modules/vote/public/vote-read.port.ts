export abstract class VoteReadPort {
  abstract getStats(resourceId: string): Promise<{ votes: number }>;
  abstract getStatsMany(resourceIds: string[]): Promise<Record<string, number>>;
}
