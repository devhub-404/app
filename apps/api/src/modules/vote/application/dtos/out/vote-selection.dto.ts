import { ApiProperty } from '@nestjs/swagger';
import { VoteDTO } from './vote.dto';

export class VoteSelectionDTO {
  @ApiProperty({ type: () => [VoteDTO] })
  items!: VoteDTO[];
}
