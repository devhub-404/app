import { Injectable } from '@nestjs/common';
import { VoteQueryRepository } from '@/modules/vote/application/ports/repositories/vote.query.repository';
import { AppError } from '@/shared/errors/app-error';
import { VoteStatisticsDTO } from '@/modules/vote/application/dtos/out';
import { VoteTargetAccessService } from '@/modules/vote/application/votes/vote-target-access.service';

@Injectable()
export class GetVoteStatsQuery {
  constructor(
    private readonly voteQueryRepository: VoteQueryRepository,
    private readonly targetAccess: VoteTargetAccessService,
  ) {}

  async execute(resourceId: string): Promise<VoteStatisticsDTO> {
    if (!(await this.targetAccess.isVoteable(resourceId))) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

    return { contentId: resourceId, ...(await this.voteQueryRepository.getStats(resourceId)) };
  }
}
