import { Injectable } from '@nestjs/common';
import { VoteQueryRepository } from '@/modules/vote/application/ports/repositories/vote.query.repository';
import { SyncMyVotesDTO } from '@/modules/vote/application/dtos/out';

@Injectable()
export class SyncMyVotesQuery {
  constructor(private readonly votes: VoteQueryRepository) {}

  async execute(accountId: string, updatedAfter?: string): Promise<SyncMyVotesDTO> {
    const syncedThrough = new Date().toISOString();
    const items = await this.votes.syncVotes(accountId, syncedThrough, updatedAfter);

    return { items, syncedThrough };
  }
}
