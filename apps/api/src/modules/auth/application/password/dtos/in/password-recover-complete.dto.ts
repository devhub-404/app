import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PasswordRecoverCompleteDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  registrationRecord!: string;
}
