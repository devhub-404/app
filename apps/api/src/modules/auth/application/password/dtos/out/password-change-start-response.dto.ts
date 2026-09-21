import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PasswordChangeStartResponseDTO {
  @IsString()
  @ApiProperty()
  changeToken!: string;

  @IsString()
  @ApiProperty()
  registrationResponse!: string;
}
