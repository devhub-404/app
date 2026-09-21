import { Injectable } from '@nestjs/common';
import type { VoteDTO } from '@/modules/vote/application/dtos/out';
import { VoteSelectionDTO } from '@/modules/vote/application/dtos/out';
import { VoteQueryRepository } from '@/modules/vote/application/ports/repositories/vote.query.repository';

@Injectable()
export class ListMyVotesQuery {
  constructor(private readonly voteQueryRepository: VoteQueryRepository) {}

  async execute(accountId: string, resourceIds: string[]): Promise<VoteSelectionDTO> {
    if (!resourceIds.length) return { items: [] };
    const items: VoteDTO[] = await this.voteQueryRepository.getVotes(accountId, resourceIds);

    return { items };
  }
}
