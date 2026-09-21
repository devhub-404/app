import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PasswordRegisterStartResponseDTO {
  @IsString()
  @ApiProperty()
  registrationResponse!: string;

  @IsString()
  @ApiProperty()
  opaqueUserIdentifier!: string;
}
