import { ApiProperty } from '@nestjs/swagger';

export class PasswordChangedDTO {
  @ApiProperty()
  changed!: true;
}
