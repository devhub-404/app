import type { AuthSessionAuthMethod } from '@/modules/auth/application/sessions/ports/session.repository';

export type SessionRow = {
  id: string;
  userId: string;
  credentialId: string | null;
  authMethod: AuthSessionAuthMethod;
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
  lastProofOfPossessionAt: Date;
  createdAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
};

export abstract class SessionQueryRepository {
  abstract findActiveByUserId(userId: string): Promise<SessionRow[]>;
  abstract findActiveById(userId: string, sessionId: string): Promise<SessionRow | null>;
}
