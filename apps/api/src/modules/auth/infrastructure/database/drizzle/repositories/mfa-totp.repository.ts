import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { mfaTotpSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/mfa-totp.schema';
import { mfaRecoveryCodeSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/mfa-recovery-code.schema';
import { MfaTotpRepository, type MfaDisabledSnapshot } from '@/modules/auth/application/mfa/ports/mfa-totp.repository';

@Injectable()
export class DrizzleMfaTotpRepository implements MfaTotpRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async findByUserId(userId: string) {
    const [row] = await this.db.select().from(mfaTotpSchema).where(eq(mfaTotpSchema.userId, userId));

    return row ?? null;
  }

  async upsert(input: { userId: string; encryptedSecret: string; status: 'pending' | 'active' }): Promise<void> {
    await this.db
      .insert(mfaTotpSchema)
      .values({
        userId: input.userId,
        encryptedSecret: input.encryptedSecret,
        status: input.status,
      })
      .onConflictDoUpdate({
        target: mfaTotpSchema.userId,
        set: {
          encryptedSecret: input.encryptedSecret,
          status: input.status,
          updatedAt: new Date(),
        },
      });
  }

  async activateEnrollment(userId: string, recoveryCodeHashes: string[]): Promise<boolean> {
    return await this.db.transaction(async (tx) => {
      const [activated] = await tx
        .update(mfaTotpSchema)
        .set({ status: 'active', updatedAt: new Date() })
        .where(and(eq(mfaTotpSchema.userId, userId), eq(mfaTotpSchema.status, 'pending')))
        .returning({ id: mfaTotpSchema.id });
      if (!activated) return false;

      await tx.delete(mfaRecoveryCodeSchema).where(eq(mfaRecoveryCodeSchema.userId, userId));

      if (recoveryCodeHashes.length > 0) {
        await tx.insert(mfaRecoveryCodeSchema).values(
          recoveryCodeHashes.map((codeHash) => ({
            userId,
            codeHash,
          })),
        );
      }

      return true;
    });
  }

  async disableMfa(userId: string): Promise<MfaDisabledSnapshot | null> {
    return await this.db.transaction(async (tx) => {
      const [totp] = await tx
        .select({ encryptedSecret: mfaTotpSchema.encryptedSecret })
        .from(mfaTotpSchema)
        .where(and(eq(mfaTotpSchema.userId, userId), eq(mfaTotpSchema.status, 'active')))
        .for('update');
      if (!totp) return null;

      const recoveryCodes = await tx
        .select({ codeHash: mfaRecoveryCodeSchema.codeHash, usedAt: mfaRecoveryCodeSchema.usedAt })
        .from(mfaRecoveryCodeSchema)
        .where(eq(mfaRecoveryCodeSchema.userId, userId));

      await tx.delete(mfaRecoveryCodeSchema).where(eq(mfaRecoveryCodeSchema.userId, userId));
      await tx
        .update(mfaTotpSchema)
        .set({ status: 'disabled', updatedAt: new Date() })
        .where(and(eq(mfaTotpSchema.userId, userId), eq(mfaTotpSchema.status, 'active')));

      return { userId, encryptedSecret: totp.encryptedSecret, recoveryCodes };
    });
  }

  async restoreDisabledMfa(snapshot: MfaDisabledSnapshot): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx
        .update(mfaTotpSchema)
        .set({ encryptedSecret: snapshot.encryptedSecret, status: 'active', updatedAt: new Date() })
        .where(eq(mfaTotpSchema.userId, snapshot.userId));
      await tx.delete(mfaRecoveryCodeSchema).where(eq(mfaRecoveryCodeSchema.userId, snapshot.userId));
      if (snapshot.recoveryCodes.length > 0) {
        await tx.insert(mfaRecoveryCodeSchema).values(
          snapshot.recoveryCodes.map((code) => ({
            userId: snapshot.userId,
            codeHash: code.codeHash,
            usedAt: code.usedAt,
          })),
        );
      }
    });
  }

  async replaceRecoveryCodes(userId: string, recoveryCodeHashes: string[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(mfaRecoveryCodeSchema).where(eq(mfaRecoveryCodeSchema.userId, userId));
      if (recoveryCodeHashes.length > 0) {
        await tx.insert(mfaRecoveryCodeSchema).values(
          recoveryCodeHashes.map((codeHash) => ({
            userId,
            codeHash,
          })),
        );
      }
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.db.delete(mfaTotpSchema).where(eq(mfaTotpSchema.userId, userId));
  }
}
