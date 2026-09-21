import { Injectable } from '@nestjs/common';
import { VoteQueryRepository } from '@/modules/vote/application/ports/repositories/vote.query.repository';
import { VoteReadPort } from './vote-read.port';

@Injectable()
export class VoteReadService implements VoteReadPort {
  constructor(private readonly votes: VoteQueryRepository) {}
  getStats(resourceId: string) {
    return this.votes.getStats(resourceId);
  }
  getStatsMany(resourceIds: string[]) {
    return this.votes.getStatsMany([...new Set(resourceIds)]);
  }
}
