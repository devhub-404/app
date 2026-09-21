import { ApiHideProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { OAuthAuthorizationDTO } from './oauth-authorization.dto';

export class OAuthAuthorizationResultDTO extends OAuthAuthorizationDTO {
  @ApiHideProperty()
  @IsString()
  browserContext!: { state: string; codeVerifier: string };
}

export class CompleteOAuthLoginResultDTO {
  @ApiHideProperty() @IsOptional() @IsString() sessionSecret?: string;
  @ApiHideProperty() @IsOptional() mfaRequired?: true;
  @ApiHideProperty() @IsOptional() @IsString() token?: string;
  @ApiHideProperty() @IsOptional() @IsArray() @IsString({ each: true }) methods?: string[];
  @ApiHideProperty() @IsOptional() restoreAccessRequested?: true;
  @ApiHideProperty() @IsOptional() reactivationRequired?: true;
  @ApiHideProperty() @IsOptional() @IsString() reactivationToken?: string;
}
