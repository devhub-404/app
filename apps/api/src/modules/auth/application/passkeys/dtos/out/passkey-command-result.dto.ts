import { ApiHideProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CompletePasskeyLoginResultDTO {
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
}
