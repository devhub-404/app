import { ApiHideProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CompleteMagicLinkLoginResultDTO {
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
  redirect?: string | null;

  @ApiHideProperty()
  @IsOptional()
  @IsBoolean()
  emailVerificationRequested?: true;
}
