import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt, isNotNull, isNull, lte, or } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { accountsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/accounts.schema';
import { accountEmailsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-emails.schema';
import { accountRolesSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/account-role.schema';
import { rolesSchema } from '@/shared/infrastructure/database/drizzle/schema/user/account/role.schema';
import { sessionsSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/sessions.schema';
import {
  SessionAuthenticationQueryRepository,
  type SessionAuthenticationRow,
} from '@/modules/auth/application/sessions/ports/session-authentication.query.repository';
import type { Role } from '@/shared/kernel/auth/role';

@Injectable()
export class DrizzleSessionAuthenticationQueryRepository implements SessionAuthenticationQueryRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async findActiveBySecretHash(sessionSecretHash: string): Promise<SessionAuthenticationRow | null> {
    const [row] = await this.db.$primary
      .select({
        sessionId: sessionsSchema.id,
        userId: sessionsSchema.userId,
        mfaEnabled: accountsSchema.mfaEnabled,
        role: rolesSchema.name,
      })
      .from(sessionsSchema)
      .innerJoin(accountsSchema, eq(accountsSchema.id, sessionsSchema.userId))
      .innerJoin(
        accountEmailsSchema,
        and(
          eq(accountEmailsSchema.userId, accountsSchema.id),
          eq(accountEmailsSchema.type, 'primary'),
          isNotNull(accountEmailsSchema.verifiedAt),
        ),
      )
      .leftJoin(accountRolesSchema, eq(accountRolesSchema.userId, accountsSchema.id))
      .leftJoin(rolesSchema, eq(rolesSchema.id, accountRolesSchema.roleId))
      .where(
        and(
          eq(sessionsSchema.sessionSecretHash, sessionSecretHash),
          isNull(sessionsSchema.revokedAt),
          gt(sessionsSchema.expiresAt, new Date()),
          eq(accountsSchema.voluntaryStatus, 'active'),
          eq(accountsSchema.moderationStatus, 'none'),
          eq(accountsSchema.deletionStatus, 'none'),
          or(isNull(accountsSchema.lockedUntil), lte(accountsSchema.lockedUntil, new Date())),
        ),
      )
      .limit(1)
      .$withCache({
        config: { ex: 30 },
        autoInvalidate: true,
      });

    if (!row) return null;

    return {
      ...row,
      role: row.role as Role | null,
    };
  }
}
