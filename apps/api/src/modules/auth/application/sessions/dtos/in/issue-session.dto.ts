import { ApiHideProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsIP, IsOptional, IsString } from 'class-validator';
import type { AuthSessionAuthMethod } from '@/modules/auth/application/sessions/ports/session.repository';

const AUTH_SESSION_AUTH_METHODS: AuthSessionAuthMethod[] = [
  'password',
  'oauth',
  'passkey',
  'magic_link',
  'restore_access',
];

export class IssueSessionInputDTO {
  @ApiHideProperty() @IsString() userId!: string;
  @ApiHideProperty() @IsOptional() @IsString() credentialId?: string | null;
  @ApiHideProperty() @IsIn(AUTH_SESSION_AUTH_METHODS) authMethod!: AuthSessionAuthMethod;
  @ApiHideProperty() @IsOptional() @IsBoolean() mfaVerified?: boolean;
  @ApiHideProperty() @IsOptional() @IsIP() ipAddress?: string | null;
  @ApiHideProperty() @IsOptional() @IsString() userAgent?: string | null;
  @ApiHideProperty() @IsOptional() @IsString() deviceName?: string | null;
}
