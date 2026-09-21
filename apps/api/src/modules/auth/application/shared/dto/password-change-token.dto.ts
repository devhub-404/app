import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { JwtTokenType } from './jwt-token-type';

export class PasswordChangeTokenDTO {
  @IsUUID()
  @ApiProperty()
  sub!: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ required: false })
  credentialId?: string;

  @IsIn([JwtTokenType.PASSWORD_CHANGE])
  @ApiProperty({ enum: [JwtTokenType.PASSWORD_CHANGE] })
  type!: JwtTokenType.PASSWORD_CHANGE;
}
