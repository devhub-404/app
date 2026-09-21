import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsUUID } from 'class-validator';
import { JwtTokenType } from './jwt-token-type';

export class EmailVerificationTokenDTO {
  @IsUUID()
  @ApiProperty()
  sub!: string;

  @IsEmail()
  @ApiProperty()
  email!: string;

  @IsIn([JwtTokenType.EMAIL_VERIFICATION])
  @ApiProperty({ enum: [JwtTokenType.EMAIL_VERIFICATION] })
  type!: JwtTokenType.EMAIL_VERIFICATION;
}
