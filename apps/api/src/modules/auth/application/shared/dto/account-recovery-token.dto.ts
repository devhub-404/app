import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsUUID } from 'class-validator';
import { JwtTokenType } from './jwt-token-type';

export class AccountRecoveryTokenDTO {
  @IsUUID()
  @ApiProperty()
  sub!: string;

  @IsEmail()
  @ApiProperty()
  email!: string;

  @IsIn([JwtTokenType.ACCOUNT_RECOVERY])
  @ApiProperty({ enum: [JwtTokenType.ACCOUNT_RECOVERY] })
  type!: JwtTokenType.ACCOUNT_RECOVERY;
}
