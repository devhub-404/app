import { Injectable } from '@nestjs/common';
import { VoteRepository } from '@/modules/vote/application/ports/repositories/vote.repository';
import { VoteSetResultDTO } from '@/modules/vote/application/dtos/out';

@Injectable()
export class RemoveVoteCommand {
  constructor(private readonly voteRepository: VoteRepository) {}

  async execute(accountId: string, resourceId: string): Promise<VoteSetResultDTO> {
    await this.voteRepository.removeVote(accountId, resourceId);

    return { resourceId, active: false };
  }
}
