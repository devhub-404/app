import type { Session } from '@/modules/auth/domain/entities/session';
import { CreateSessionRecordDTO } from '@/modules/auth/application/shared/dtos/internal/session-command.dto';

export type AuthSessionAuthMethod = 'password' | 'oauth' | 'passkey' | 'magic_link' | 'restore_access';

export type ActiveSessionRow = {
  id: string;
  userId: string;
  credentialId: string | null;
  authMethod: AuthSessionAuthMethod;
  sessionSecretHash: string;
  lastProofOfPossessionAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
};

export abstract class SessionRepository {
  abstract findActiveAggregateById(userId: string, sessionId: string): Promise<Session | null>;
  abstract saveAggregate(session: Session): Promise<boolean>;

  abstract create(input: CreateSessionRecordDTO): Promise<{ id: string }>;

  abstract renewAfterProof(
    userId: string,
    sessionId: string,
    lastProofOfPossessionAt: Date,
    expiresAt: Date,
  ): Promise<boolean>;
  abstract revoke(id: string): Promise<void>;
  abstract revokeByUserId(userId: string): Promise<void>;
  abstract revokeOthersByUserId(userId: string, exceptSessionId: string): Promise<void>;
  abstract deleteByUserId(userId: string): Promise<void>;
  abstract deleteExpiredBefore(cutoff: Date): Promise<number>;
  abstract findActiveById(userId: string, sessionId: string): Promise<ActiveSessionRow | null>;
  abstract findActiveBySecretHash(sessionSecretHash: string): Promise<ActiveSessionRow | null>;
  abstract findNonRevokedById(userId: string, sessionId: string): Promise<ActiveSessionRow | null>;
}
