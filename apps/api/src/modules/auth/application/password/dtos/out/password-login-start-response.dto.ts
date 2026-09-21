import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PasswordLoginStartResponseDTO {
  @IsString()
  @ApiProperty()
  serverLoginState!: string;

  @IsString()
  @ApiProperty()
  loginResponse!: string;
}
