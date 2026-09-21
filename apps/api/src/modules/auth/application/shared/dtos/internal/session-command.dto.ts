import { IsIn, IsOptional, IsString } from 'class-validator';
import type { AuthSessionAuthMethod } from '@/modules/auth/application/sessions/ports/session.repository';

export class CreateSessionRecordDTO {
  @IsOptional() @IsString() id?: string;
  @IsString() userId!: string;
  @IsOptional() @IsString() credentialId?: string | null;
  @IsIn(['password', 'oauth', 'passkey', 'magic_link', 'restore_access']) authMethod!: AuthSessionAuthMethod;
  @IsString() sessionSecretHash!: string;
  @IsOptional() @IsString() ipAddress?: string | null;
  @IsOptional() @IsString() userAgent?: string | null;
  @IsOptional() @IsString() deviceName?: string | null;
  lastProofOfPossessionAt!: Date;
  expiresAt!: Date;
}

export class CreateSessionWithTokensDTO {
  @IsString() userId!: string;
  @IsOptional() @IsString() credentialId?: string | null;
  @IsIn(['password', 'oauth', 'passkey', 'magic_link', 'restore_access']) authMethod!: AuthSessionAuthMethod;
  @IsOptional() @IsString() ipAddress?: string | null;
  @IsOptional() @IsString() userAgent?: string | null;
  @IsOptional() @IsString() deviceName?: string | null;
}
