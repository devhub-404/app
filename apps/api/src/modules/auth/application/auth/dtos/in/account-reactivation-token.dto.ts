import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { JwtTokenType } from '@/modules/auth/application/shared/dto';

const PRIMARY_AUTH_METHODS = ['password', 'passkey', 'oauth', 'magic_link'] as const;

export class AccountReactivationTokenDTO {
  @IsUUID()
  @ApiProperty()
  sub!: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ required: false })
  credentialId?: string;

  @IsIn(PRIMARY_AUTH_METHODS)
  @ApiProperty({ enum: PRIMARY_AUTH_METHODS })
  method!: (typeof PRIMARY_AUTH_METHODS)[number];

  @IsIn([JwtTokenType.ACCOUNT_REACTIVATION])
  @ApiProperty({ enum: [JwtTokenType.ACCOUNT_REACTIVATION] })
  type!: JwtTokenType.ACCOUNT_REACTIVATION;
}
