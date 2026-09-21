import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PasswordCredentialCreateCompleteDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  registrationRecord!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  opaqueUserIdentifier!: string;
}
