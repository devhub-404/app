import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PasswordChangeCompleteDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  changeToken!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  registrationRecord!: string;
}
