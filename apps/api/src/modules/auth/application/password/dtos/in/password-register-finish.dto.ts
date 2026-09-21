import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PasswordRegisterFinishDTO {
  @IsEmail()
  @ApiProperty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  registrationRecord!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  opaqueUserIdentifier!: string;
}
