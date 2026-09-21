import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gt, isNull, lt, ne, or } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { sessionsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/sessions.schema';
import {
  type ActiveSessionRow,
  type AuthSessionAuthMethod,
  SessionRepository,
} from '@/modules/auth/application/sessions/ports/session.repository';
import { Session } from '@/modules/auth/domain/entities/session';

@Injectable()
export class DrizzleSessionRepository implements SessionRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async findActiveAggregateById(userId: string, sessionId: string): Promise<Session | null> {
    const row = await this.findActiveById(userId, sessionId);
    if (!row) return null;

    return Session.rehydrate(row.id, {
      userId: row.userId,
      authMethod: row.authMethod,
      sessionSecretHash: row.sessionSecretHash,
      lastProofOfPossessionAt: row.lastProofOfPossessionAt,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
    });
  }

  async saveAggregate(session: Session): Promise<boolean> {
    const [row] = await this.db
      .update(sessionsSchema)
      .set({
        lastProofOfPossessionAt: session.lastProofOfPossessionAt,
        expiresAt: session.expiresAt,
        revokedAt: session.revokedAtValue,
      })
      .where(and(eq(sessionsSchema.id, session.id), isNull(sessionsSchema.revokedAt)))
      .returning({ id: sessionsSchema.id });

    return Boolean(row);
  }

  async create(input: {
    id?: string;
    userId: string;
    credentialId?: string | null;
    authMethod: AuthSessionAuthMethod;
    sessionSecretHash: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    deviceName?: string | null;
    lastProofOfPossessionAt: Date;
    expiresAt: Date;
  }): Promise<{ id: string }> {
    const [row] = await this.db
      .insert(sessionsSchema)
      .values({
        id: input.id,
        userId: input.userId,
        credentialId: input.credentialId ?? null,
        authMethod: input.authMethod,
        sessionSecretHash: input.sessionSecretHash,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        deviceName: input.deviceName ?? null,
        lastProofOfPossessionAt: input.lastProofOfPossessionAt,
        expiresAt: input.expiresAt,
      })
      .returning({ id: sessionsSchema.id });

    if (!row) throw new Error('SESSION_CREATE_FAILED');

    return row;
  }

  async renewAfterProof(
    userId: string,
    sessionId: string,
    lastProofOfPossessionAt: Date,
    expiresAt: Date,
  ): Promise<boolean> {
    const current = await this.findActiveById(userId, sessionId);
    if (!current) return false;

    const session = Session.rehydrate(current.id, {
      userId: current.userId,
      authMethod: current.authMethod,
      sessionSecretHash: current.sessionSecretHash,
      lastProofOfPossessionAt: current.lastProofOfPossessionAt,
      expiresAt: current.expiresAt,
      revokedAt: current.revokedAt,
    });
    session.renewAfterProof(lastProofOfPossessionAt, expiresAt);

    const rows = await this.db
      .update(sessionsSchema)
      .set({ lastProofOfPossessionAt: session.lastProofOfPossessionAt, expiresAt: session.expiresAt })
      .where(
        and(
          eq(sessionsSchema.userId, userId),
          eq(sessionsSchema.id, sessionId),
          isNull(sessionsSchema.revokedAt),
          gt(sessionsSchema.expiresAt, new Date()),
        ),
      )
      .returning({ id: sessionsSchema.id });

    return rows.length === 1;
  }

  async revoke(id: string): Promise<void> {
    await this.db
      .update(sessionsSchema)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessionsSchema.id, id), isNull(sessionsSchema.revokedAt)));
  }

  async revokeByUserId(userId: string): Promise<void> {
    await this.db
      .update(sessionsSchema)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessionsSchema.userId, userId), isNull(sessionsSchema.revokedAt)));
  }

  async revokeOthersByUserId(userId: string, exceptSessionId: string): Promise<void> {
    await this.db
      .update(sessionsSchema)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(sessionsSchema.userId, userId),
          ne(sessionsSchema.id, exceptSessionId),
          isNull(sessionsSchema.revokedAt),
        ),
      );
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.db.delete(sessionsSchema).where(eq(sessionsSchema.userId, userId));
  }

  async deleteExpiredBefore(cutoff: Date): Promise<number> {
    const deleted = await this.db
      .delete(sessionsSchema)
      .where(or(lt(sessionsSchema.expiresAt, cutoff), lt(sessionsSchema.revokedAt, cutoff)))
      .returning({ id: sessionsSchema.id });

    return deleted.length;
  }

  async findActiveById(userId: string, sessionId: string): Promise<ActiveSessionRow | null> {
    const [row] = await this.db
      .select({
        id: sessionsSchema.id,
        userId: sessionsSchema.userId,
        credentialId: sessionsSchema.credentialId,
        authMethod: sessionsSchema.authMethod,
        sessionSecretHash: sessionsSchema.sessionSecretHash,
        lastProofOfPossessionAt: sessionsSchema.lastProofOfPossessionAt,
        expiresAt: sessionsSchema.expiresAt,
        revokedAt: sessionsSchema.revokedAt,
        createdAt: sessionsSchema.createdAt,
      })
      .from(sessionsSchema)
      .where(
        and(
          eq(sessionsSchema.userId, userId),
          eq(sessionsSchema.id, sessionId),
          isNull(sessionsSchema.revokedAt),
          gt(sessionsSchema.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(sessionsSchema.createdAt))
      .limit(1);

    return row ?? null;
  }

  async findActiveBySecretHash(sessionSecretHash: string): Promise<ActiveSessionRow | null> {
    const [row] = await this.db
      .select({
        id: sessionsSchema.id,
        userId: sessionsSchema.userId,
        credentialId: sessionsSchema.credentialId,
        authMethod: sessionsSchema.authMethod,
        sessionSecretHash: sessionsSchema.sessionSecretHash,
        lastProofOfPossessionAt: sessionsSchema.lastProofOfPossessionAt,
        expiresAt: sessionsSchema.expiresAt,
        revokedAt: sessionsSchema.revokedAt,
        createdAt: sessionsSchema.createdAt,
      })
      .from(sessionsSchema)
      .where(
        and(
          eq(sessionsSchema.sessionSecretHash, sessionSecretHash),
          isNull(sessionsSchema.revokedAt),
          gt(sessionsSchema.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return row ?? null;
  }

  async findNonRevokedById(userId: string, sessionId: string): Promise<ActiveSessionRow | null> {
    const [row] = await this.db
      .select({
        id: sessionsSchema.id,
        userId: sessionsSchema.userId,
        credentialId: sessionsSchema.credentialId,
        authMethod: sessionsSchema.authMethod,
        sessionSecretHash: sessionsSchema.sessionSecretHash,
        lastProofOfPossessionAt: sessionsSchema.lastProofOfPossessionAt,
        expiresAt: sessionsSchema.expiresAt,
        revokedAt: sessionsSchema.revokedAt,
        createdAt: sessionsSchema.createdAt,
      })
      .from(sessionsSchema)
      .where(and(eq(sessionsSchema.userId, userId), eq(sessionsSchema.id, sessionId), isNull(sessionsSchema.revokedAt)))
      .limit(1);

    return row ?? null;
  }
}
