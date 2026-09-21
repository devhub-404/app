import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { VoteRepository } from '@/modules/vote/application/ports/repositories/vote.repository';
import { VoteSetResultDTO } from '@/modules/vote/application/dtos/out';
import { ModerationAccountRestrictionPort } from '@/modules/moderation/public/account-restriction.port';
import { VoteTargetAccessService } from '@/modules/vote/application/votes/vote-target-access.service';

@Injectable()
export class SetVoteCommand {
  constructor(
    private readonly voteRepository: VoteRepository,
    private readonly targetAccess: VoteTargetAccessService,
    private readonly accountRestrictionService: ModerationAccountRestrictionPort,
  ) {}

  async execute(accountId: string, resourceId: string): Promise<VoteSetResultDTO> {
    await this.accountRestrictionService.assertAccountCapability(accountId, 'VOTE');
    if (!(await this.targetAccess.isVoteable(resourceId))) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');
    await this.voteRepository.setVote(accountId, resourceId);

    return { resourceId, active: true };
  }
}
