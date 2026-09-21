import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PasswordRecoverPrepareDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  registrationRequest!: string;
}
