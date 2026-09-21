import { ApiProperty } from '@nestjs/swagger';

export class AccountPurgeSummaryDTO {
  @ApiProperty()
  purgedCount!: number;
}
