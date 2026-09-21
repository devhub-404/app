import { ApiProperty } from '@nestjs/swagger';

export class VoteSetResultDTO {
  @ApiProperty() resourceId!: string;
  @ApiProperty() active!: boolean;
}
