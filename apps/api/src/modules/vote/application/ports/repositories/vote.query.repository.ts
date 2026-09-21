import { VoteDTO, SyncedVoteDTO } from '@/modules/vote/application/dtos/out';

export abstract class VoteQueryRepository {
  abstract getVotes(accountId: string, resourceIds: string[]): Promise<VoteDTO[]>;
  abstract syncVotes(accountId: string, syncedThrough: string, updatedAfter?: string): Promise<SyncedVoteDTO[]>;
  abstract getStats(resourceId: string): Promise<{ votes: number }>;
  abstract getStatsMany(resourceIds: string[]): Promise<Record<string, number>>;
}
