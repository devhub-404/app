import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { sessionsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/sessions.schema';
import {
  SessionQueryRepository,
  type SessionRow,
} from '@/modules/auth/application/sessions/ports/session.query.repository';

@Injectable()
export class DrizzleSessionQueryRepository implements SessionQueryRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async findActiveByUserId(userId: string): Promise<SessionRow[]> {
    return await this.db
      .select({
        id: sessionsSchema.id,
        userId: sessionsSchema.userId,
        credentialId: sessionsSchema.credentialId,
        authMethod: sessionsSchema.authMethod,
        ipAddress: sessionsSchema.ipAddress,
        userAgent: sessionsSchema.userAgent,
        deviceName: sessionsSchema.deviceName,
        lastProofOfPossessionAt: sessionsSchema.lastProofOfPossessionAt,
        createdAt: sessionsSchema.createdAt,
        expiresAt: sessionsSchema.expiresAt,
        revokedAt: sessionsSchema.revokedAt,
      })
      .from(sessionsSchema)
      .where(
        and(
          eq(sessionsSchema.userId, userId),
          isNull(sessionsSchema.revokedAt),
          gt(sessionsSchema.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(sessionsSchema.createdAt));
  }

  async findActiveById(userId: string, sessionId: string): Promise<SessionRow | null> {
    const [row] = await this.db
      .select({
        id: sessionsSchema.id,
        userId: sessionsSchema.userId,
        credentialId: sessionsSchema.credentialId,
        authMethod: sessionsSchema.authMethod,
        ipAddress: sessionsSchema.ipAddress,
        userAgent: sessionsSchema.userAgent,
        deviceName: sessionsSchema.deviceName,
        lastProofOfPossessionAt: sessionsSchema.lastProofOfPossessionAt,
        createdAt: sessionsSchema.createdAt,
        expiresAt: sessionsSchema.expiresAt,
        revokedAt: sessionsSchema.revokedAt,
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
      .limit(1);

    return row ?? null;
  }
}
