import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PasswordChangeStartDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  registrationRequest!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  serverLoginState!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  finishLoginRequest!: string;
}
