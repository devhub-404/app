import { ApiProperty } from '@nestjs/swagger';

export class PasswordRecoveryCompletedDTO {
  @ApiProperty()
  recovered!: true;
}
