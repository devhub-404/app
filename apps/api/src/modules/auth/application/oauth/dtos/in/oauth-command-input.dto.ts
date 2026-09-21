import { ApiHideProperty } from '@nestjs/swagger';
import { IsIP, IsOptional, IsString } from 'class-validator';
import type { OAuthProviderName } from '@/modules/auth/domain/services/oauth-provider.service';
import { CompleteOAuthLinkDTO } from './complete-oauth-link.dto';
import { CompleteOAuthLoginDTO } from './complete-oauth-login.dto';

export class StartOAuthLoginInputDTO {
  @ApiHideProperty() @IsString() provider!: OAuthProviderName;
}

export class StartOAuthLinkInputDTO {
  @ApiHideProperty() @IsString() userId!: string;
  @ApiHideProperty() @IsString() sessionId!: string;
  @ApiHideProperty() @IsString() provider!: OAuthProviderName;
}

export class CompleteOAuthLoginInputDTO extends CompleteOAuthLoginDTO {
  @ApiHideProperty() @IsString() browserState!: string;
  @ApiHideProperty() @IsString() codeVerifier!: string;
  @ApiHideProperty() @IsOptional() @IsIP() ipAddress?: string | null;
  @ApiHideProperty() @IsOptional() @IsString() userAgent?: string | null;
}

export class CompleteOAuthLinkInputDTO extends CompleteOAuthLinkDTO {
  @ApiHideProperty() @IsString() userId!: string;
  @ApiHideProperty() @IsString() sessionId!: string;
  @ApiHideProperty() @IsString() browserState!: string;
  @ApiHideProperty() @IsString() codeVerifier!: string;
}
