import { ApiProperty } from '@nestjs/swagger';

export class SyncedVoteDTO {
  @ApiProperty() resourceId!: string;
  @ApiProperty() active!: boolean;
  @ApiProperty() updatedAt!: string;
}
