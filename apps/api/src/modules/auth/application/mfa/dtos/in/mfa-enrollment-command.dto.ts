import { ApiHideProperty } from '@nestjs/swagger';
import { IsIP, IsOptional, IsString } from 'class-validator';
import { MfaTotpEnrollCompleteDTO } from './mfa-totp-enroll-complete.dto';
import type { AuthSessionAuthMethod } from '@/modules/auth/application/sessions/ports/session.repository';

export class CompleteTotpEnrollmentInputDTO extends MfaTotpEnrollCompleteDTO {
  @ApiHideProperty() @IsString() userId!: string;
  @ApiHideProperty() @IsString() sessionId!: string;
  @ApiHideProperty() @IsOptional() @IsIP() ipAddress?: string | null;
  @ApiHideProperty() @IsOptional() @IsString() userAgent?: string | null;
  @ApiHideProperty() @IsOptional() @IsString() deviceName?: string | null;
}

export class MfaChallengeInputDTO {
  @ApiHideProperty() @IsString() userId!: string;
  @ApiHideProperty() @IsOptional() @IsString() credentialId?: string | null;
  @ApiHideProperty() @IsString() authMethod!: AuthSessionAuthMethod;
}
