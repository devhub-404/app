import { ApiProperty } from '@nestjs/swagger';

export class SubmitContactMessageOutputDTO {
  @ApiProperty()
  accepted!: true;
}
