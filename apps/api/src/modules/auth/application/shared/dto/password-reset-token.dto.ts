import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsUUID } from 'class-validator';
import { JwtTokenType } from './jwt-token-type';

export class PasswordResetTokenDTO {
  @IsUUID()
  @ApiProperty()
  sub!: string;

  @IsEmail()
  @ApiProperty()
  email!: string;

  @IsIn([JwtTokenType.PASSWORD_RESET])
  @ApiProperty({ enum: [JwtTokenType.PASSWORD_RESET] })
  type!: JwtTokenType.PASSWORD_RESET;
}
