import type { Role } from '@/shared/kernel/auth/role';

export type SessionAuthenticationRow = {
  sessionId: string;
  userId: string;
  mfaEnabled: boolean;
  role: Role | null;
};

export abstract class SessionAuthenticationQueryRepository {
  abstract findActiveBySecretHash(sessionSecretHash: string): Promise<SessionAuthenticationRow | null>;
}
