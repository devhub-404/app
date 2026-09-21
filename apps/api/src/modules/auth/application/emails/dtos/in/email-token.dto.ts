import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EmailTokenDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token!: string;
}
