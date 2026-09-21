import { ApiHideProperty } from '@nestjs/swagger';
import { IsIP, IsOptional, IsString } from 'class-validator';
import { MfaRecoveryCodeVerifyDTO } from './mfa-recovery-code-verify.dto';
import { MfaTotpVerifyDTO } from './mfa-totp-verify.dto';

export class VerifyTotpInputDTO extends MfaTotpVerifyDTO {
  @ApiHideProperty()
  @IsOptional()
  @IsIP()
  ipAddress?: string | null;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  userAgent?: string | null;
}

export class VerifyRecoveryCodeInputDTO extends MfaRecoveryCodeVerifyDTO {
  @ApiHideProperty()
  @IsOptional()
  @IsIP()
  ipAddress?: string | null;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  userAgent?: string | null;
}
