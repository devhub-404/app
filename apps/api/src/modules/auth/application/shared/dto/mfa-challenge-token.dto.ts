import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { JwtTokenType } from './jwt-token-type';

export class MfaChallengeTokenDTO {
  @IsUUID()
  @ApiProperty()
  sub!: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ required: false })
  credentialId?: string;

  @IsIn(['password', 'passkey', 'oauth', 'magic_link', 'restore_access'])
  @ApiProperty({ enum: ['password', 'passkey', 'oauth', 'magic_link', 'restore_access'] })
  method!: 'password' | 'passkey' | 'oauth' | 'magic_link' | 'restore_access';

  @IsIn([JwtTokenType.MFA_CHALLENGE])
  @ApiProperty({ enum: [JwtTokenType.MFA_CHALLENGE] })
  type!: JwtTokenType.MFA_CHALLENGE;
}
