import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsUUID } from 'class-validator';
import { JwtTokenType } from './jwt-token-type';

export class EmailChangeBackupTokenDTO {
  @IsUUID()
  @ApiProperty()
  sub!: string;

  @IsEmail()
  @ApiProperty()
  email!: string;

  @IsIn([JwtTokenType.EMAIL_CHANGE_BACKUP])
  @ApiProperty({ enum: [JwtTokenType.EMAIL_CHANGE_BACKUP] })
  type!: JwtTokenType.EMAIL_CHANGE_BACKUP;
}
