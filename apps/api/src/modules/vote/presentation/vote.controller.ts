import { Controller, Delete, Get, Param, Put, Query, UseGuards, Version } from '@nestjs/common';
import { AuthGuard, User } from '@/modules/auth/public/http';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import { SetVoteCommand } from '../application/use-cases/command/set-vote.command';
import { RemoveVoteCommand } from '../application/use-cases/command/remove-vote.command';
import { SyncMyVotesQuery } from '../application/use-cases/query/sync-my-votes.query';
import { VoteSetResultDTO } from '../application/dtos/out/vote-set-result.dto';
import { SyncMyVotesDTO } from '../application/dtos/out/sync-my-votes.dto';
import { SyncMyVotesQueryDTO } from '../application/dtos/in/sync-my-votes-query.dto';

@Controller()
@UseGuards(AuthGuard)
export class VoteController {
  constructor(
    private readonly setVote: SetVoteCommand,
    private readonly removeVote: RemoveVoteCommand,
    private readonly sync: SyncMyVotesQuery,
  ) {}

  @Version('1')
  @Put('votes/:resourceId')
  @AppResponse('CONTENT_VOTE_SET', VoteSetResultDTO)
  set(@User('id') accountId: string, @Param('resourceId', ParseUUIDPipe) resourceId: string) {
    return this.setVote.execute(accountId, resourceId);
  }

  @Version('1')
  @Delete('votes/:resourceId')
  @AppResponse('CONTENT_VOTE_SET', VoteSetResultDTO)
  remove(@User('id') accountId: string, @Param('resourceId', ParseUUIDPipe) resourceId: string) {
    return this.removeVote.execute(accountId, resourceId);
  }

  @Version('1')
  @Get('me/votes')
  @AppResponse('CONTENT_VOTE_SYNCED', SyncMyVotesDTO)
  syncMine(@User('id') accountId: string, @Query() query: SyncMyVotesQueryDTO) {
    return this.sync.execute(accountId, query.updatedAfter);
  }
}
