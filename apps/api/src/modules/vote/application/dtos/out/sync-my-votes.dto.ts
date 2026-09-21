import { ApiProperty } from '@nestjs/swagger';

import { SyncedVoteDTO } from './synced-vote.dto';

export class SyncMyVotesDTO {
  @ApiProperty({ type: () => SyncedVoteDTO, isArray: true })
  items!: SyncedVoteDTO[];

  @ApiProperty()
  syncedThrough!: string;
}
