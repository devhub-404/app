import { ApiProperty } from '@nestjs/swagger';

export class VoteStatisticsDTO {
  @ApiProperty()
  contentId!: string;

  @ApiProperty()
  votes!: number;
}
