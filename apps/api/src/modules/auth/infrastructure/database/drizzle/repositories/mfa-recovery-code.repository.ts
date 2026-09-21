import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { mfaRecoveryCodeSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/mfa-recovery-code.schema';
import { MfaRecoveryCodeRepository } from '@/modules/auth/application/mfa/ports/mfa-recovery-code.repository';

@Injectable()
export class DrizzleMfaRecoveryCodeRepository implements MfaRecoveryCodeRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async findUnusedByUserIdAndHash(userId: string, codeHash: string) {
    const [row] = await this.db
      .select()
      .from(mfaRecoveryCodeSchema)
      .where(
        and(
          eq(mfaRecoveryCodeSchema.userId, userId),
          eq(mfaRecoveryCodeSchema.codeHash, codeHash),
          isNull(mfaRecoveryCodeSchema.usedAt),
        ),
      );

    return row ?? null;
  }

  async consumeUnusedByUserIdAndHash(userId: string, codeHash: string) {
    const [row] = await this.db
      .update(mfaRecoveryCodeSchema)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(mfaRecoveryCodeSchema.userId, userId),
          eq(mfaRecoveryCodeSchema.codeHash, codeHash),
          isNull(mfaRecoveryCodeSchema.usedAt),
        ),
      )
      .returning();

    return row ?? null;
  }

  async listByUserId(userId: string) {
    return await this.db.select().from(mfaRecoveryCodeSchema).where(eq(mfaRecoveryCodeSchema.userId, userId));
  }

  async createMany(input: { userId: string; codeHashes: string[] }): Promise<void> {
    if (input.codeHashes.length === 0) return;

    await this.db.insert(mfaRecoveryCodeSchema).values(
      input.codeHashes.map((codeHash) => ({
        userId: input.userId,
        codeHash,
      })),
    );
  }

  async markUsed(id: string): Promise<void> {
    await this.db.update(mfaRecoveryCodeSchema).set({ usedAt: new Date() }).where(eq(mfaRecoveryCodeSchema.id, id));
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.db.delete(mfaRecoveryCodeSchema).where(eq(mfaRecoveryCodeSchema.userId, userId));
  }
}
