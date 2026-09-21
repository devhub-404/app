import { ApiHideProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CompleteTotpEnrollmentResultDTO {
  @ApiHideProperty() @IsArray() @IsString({ each: true }) recoveryCodes!: string[];
  @ApiHideProperty() @IsString() sessionSecret!: string;
}

export class MfaChallengeResultDTO {
  @IsString() token!: string;
  @IsArray() @IsString({ each: true }) methods!: string[];
  mfaRequired!: true;
}
