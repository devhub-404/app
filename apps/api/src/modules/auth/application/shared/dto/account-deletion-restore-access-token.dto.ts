import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsUUID } from 'class-validator';
import { JwtTokenType } from './jwt-token-type';

export class AccountDeletionRestoreAccessTokenDTO {
  @IsUUID()
  @ApiProperty()
  sub!: string;

  @IsEmail()
  @ApiProperty()
  email!: string;

  @IsIn([JwtTokenType.ACCOUNT_DELETION_RESTORE_ACCESS])
  @ApiProperty({ enum: [JwtTokenType.ACCOUNT_DELETION_RESTORE_ACCESS] })
  type!: JwtTokenType.ACCOUNT_DELETION_RESTORE_ACCESS;
}
