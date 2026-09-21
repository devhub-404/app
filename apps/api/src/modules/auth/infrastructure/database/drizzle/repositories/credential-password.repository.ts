import { Inject, Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import {
  CredentialPasswordRepository,
  type CredentialPasswordRow,
} from '@/modules/auth/application/password/ports/credential-password.repository';
import { credentialPasswordSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential-password.schema';
import { credentialSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/credential.schema';

@Injectable()
export class DrizzleCredentialPasswordRepository implements CredentialPasswordRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async findByUserId(userId: string): Promise<CredentialPasswordRow | null> {
    const [row] = await this.db
      .select({
        credentialId: credentialSchema.id,
        userId: credentialSchema.userId,
        verifier: credentialPasswordSchema.verifier,
        opaqueUserIdentifier: credentialPasswordSchema.opaqueUserIdentifier,
        scheme: credentialPasswordSchema.scheme,
        failedAttempts: credentialPasswordSchema.failedAttempts,
        lockedUntil: credentialPasswordSchema.lockedUntil,
      })
      .from(credentialPasswordSchema)
      .innerJoin(credentialSchema, eq(credentialSchema.id, credentialPasswordSchema.id))
      .where(and(eq(credentialSchema.userId, userId), eq(credentialSchema.type, 'password')));

    return row ?? null;
  }

  async create(input: { credentialId: string; verifier: string; opaqueUserIdentifier: string }): Promise<void> {
    await this.db.insert(credentialPasswordSchema).values({
      id: input.credentialId,
      verifier: input.verifier,
      opaqueUserIdentifier: input.opaqueUserIdentifier,
    });
  }

  async updateVerifier(credentialId: string, verifier: string): Promise<void> {
    await this.db
      .update(credentialPasswordSchema)
      .set({ verifier })
      .where(eq(credentialPasswordSchema.id, credentialId));

    await this.db.update(credentialSchema).set({ updatedAt: new Date() }).where(eq(credentialSchema.id, credentialId));
  }

  async resetFailedAttempts(credentialId: string): Promise<void> {
    await this.db
      .update(credentialPasswordSchema)
      .set({ failedAttempts: 0, lockedUntil: null })
      .where(eq(credentialPasswordSchema.id, credentialId));
  }

  async incrementFailedAttempts(credentialId: string): Promise<void> {
    await this.db
      .update(credentialPasswordSchema)
      .set({ failedAttempts: sql`${credentialPasswordSchema.failedAttempts} + 1` })
      .where(eq(credentialPasswordSchema.id, credentialId));
  }

  async setLockedUntil(credentialId: string, lockedUntil: Date | null): Promise<void> {
    await this.db
      .update(credentialPasswordSchema)
      .set({ lockedUntil })
      .where(eq(credentialPasswordSchema.id, credentialId));
  }
}
