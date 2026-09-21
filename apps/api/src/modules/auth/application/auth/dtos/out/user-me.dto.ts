import type { PasskeyDeviceType } from '@/modules/auth/domain/services/passkey.service';
import { ApiProperty } from '@nestjs/swagger';

type UserMeShape = {
  user: {
    id: string;
    status: 'active' | 'deactivated' | 'suspended' | 'banned';
    mfaEnabled: boolean;
    lockedUntil: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  };
  emails: Array<{
    id: string;
    email: string;
    type: 'primary' | 'backup';
    verifiedAt: Date | null;
    createdAt: Date;
  }>;
  credentials: Array<{
    id: string;
    type: 'password' | 'oauth' | 'passkey';
    createdAt: Date;
    updatedAt: Date;
    lastUsedAt: Date | null;
    details:
      | {
          type: 'password';
          scheme: string;
          failedAttempts: number;
          lockedUntil: Date | null;
        }
      | {
          type: 'oauth';
          provider: 'github' | 'google';
          providerUserId: string;
        }
      | {
          type: 'passkey';
          webauthnId: string;
          deviceType: PasskeyDeviceType;
          backedUp: boolean;
          transports: string[] | null;
          deviceName: string | null;
          counter: number;
        }
      | null;
  }>;
  mfa: {
    enabled: boolean;
    totp: {
      enrolled: boolean;
      status: 'pending' | 'active' | 'disabled' | null;
    };
    recoveryCodesRemaining: number;
  };
  session: {
    id: string;
    authMethod: 'password' | 'oauth' | 'passkey' | 'magic_link' | 'restore_access';
    lastProofOfPossessionAt: Date;
    createdAt: Date;
    expiresAt: Date;
    revokedAt: Date | null;
    ipAddress: string | null;
    userAgent: string | null;
    deviceName: string | null;
  } | null;
};

export class UserMeDTO {
  @ApiProperty({ type: Object }) user!: UserMeShape['user'];
  @ApiProperty({ type: Object, isArray: true }) emails!: UserMeShape['emails'];
  @ApiProperty({ type: Object, isArray: true }) credentials!: UserMeShape['credentials'];
  @ApiProperty({ type: Object }) mfa!: UserMeShape['mfa'];
  @ApiProperty({ type: Object, nullable: true }) session!: UserMeShape['session'];
}
