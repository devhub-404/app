export abstract class VoteRepository {
  abstract setVote(accountId: string, resourceId: string): Promise<void>;
  abstract removeVote(accountId: string, resourceId: string): Promise<void>;
  abstract deleteByAccountId(accountId: string): Promise<number>;
  abstract deleteByResourceId(resourceId: string): Promise<number>;
}
