import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MfaTotpEnrollCompleteDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  code!: string;
}
