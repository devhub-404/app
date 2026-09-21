import { ApiProperty } from '@nestjs/swagger';

export class AccountRecoveredDTO {
  @ApiProperty()
  recovered!: true;
}
