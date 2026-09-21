import { ApiHideProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { PasswordLoginStartResponseDTO } from './password-login-start-response.dto';

export class StartPasswordLoginResultDTO extends PasswordLoginStartResponseDTO {
  @ApiHideProperty()
  @IsOptional()
  @IsString()
  credentialId?: string | null;
}

export class CompletePasswordLoginResultDTO {
  @ApiHideProperty()
  @IsOptional()
  @IsString()
  sessionSecret?: string;

  @ApiHideProperty()
  @IsOptional()
  mfaRequired?: true;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  token?: string;

  @ApiHideProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  methods?: string[];

  @ApiHideProperty()
  @IsOptional()
  restoreAccessRequested?: true;

  @ApiHideProperty()
  @IsOptional()
  reactivationRequired?: true;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  reactivationToken?: string;

  @ApiHideProperty()
  @IsOptional()
  @IsBoolean()
  emailVerificationRequested?: true;
}
