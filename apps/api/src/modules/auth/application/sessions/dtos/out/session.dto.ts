import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import type { AuthSessionAuthMethod } from '@/modules/auth/application/sessions/ports/session.repository';

const AUTH_SESSION_AUTH_METHODS: AuthSessionAuthMethod[] = [
  'password',
  'oauth',
  'passkey',
  'magic_link',
  'restore_access',
];

export class SessionDTO {
  @IsUUID()
  @ApiProperty()
  id!: string;

  @IsUUID()
  @ApiProperty()
  userId!: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ required: false, nullable: true, type: String })
  credentialId?: string | null;

  @IsIn(AUTH_SESSION_AUTH_METHODS)
  @ApiProperty({
    enum: ['password', 'oauth', 'passkey', 'magic_link', 'restore_access'],
  })
  authMethod!: AuthSessionAuthMethod;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, nullable: true, type: String })
  ipAddress?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, nullable: true, type: String })
  userAgent?: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, nullable: true, type: String })
  deviceName?: string | null;

  @IsDate()
  @ApiProperty({ type: String })
  lastProofOfPossessionAt!: Date;

  @IsDate()
  @ApiProperty({ type: String })
  createdAt!: Date;

  @IsDate()
  @ApiProperty({ type: String })
  expiresAt!: Date;

  @IsOptional()
  @IsDate()
  @ApiProperty({ required: false, nullable: true, type: String })
  revokedAt?: Date | null;
}
