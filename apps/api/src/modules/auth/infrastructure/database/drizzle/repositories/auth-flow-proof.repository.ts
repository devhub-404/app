import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt, isNull, lt } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { authFlowProofSchema } from '@/shared/infrastructure/database/drizzle/schema/user/auth/auth-flow-proof.schema';
import {
  AuthFlowProofRepository,
  type AuthFlowProofPurpose,
} from '@/modules/auth/application/shared/ports/auth-flow-proof.repository';

@Injectable()
export class DrizzleAuthFlowProofRepository implements AuthFlowProofRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async create(input: {
    jti: string;
    purpose: AuthFlowProofPurpose;
    subjectId?: string | null;
    codeHash?: string | null;
    expiresAt: Date;
  }): Promise<void> {
    await this.db.insert(authFlowProofSchema).values({
      jti: input.jti,
      purpose: input.purpose,
      subjectId: input.subjectId ?? null,
      codeHash: input.codeHash ?? null,
      expiresAt: input.expiresAt,
    });
  }

  async findUsableByCodeHash(input: { purpose: AuthFlowProofPurpose; subjectId: string; codeHash: string }) {
    const [row] = await this.db
      .select()
      .from(authFlowProofSchema)
      .where(
        and(
          eq(authFlowProofSchema.purpose, input.purpose),
          eq(authFlowProofSchema.subjectId, input.subjectId),
          eq(authFlowProofSchema.codeHash, input.codeHash),
          isNull(authFlowProofSchema.consumedAt),
          gt(authFlowProofSchema.expiresAt, new Date()),
        ),
      )
      .limit(1);
    if (!row) return null;

    return {
      ...row,
      purpose: row.purpose as AuthFlowProofPurpose,
    };
  }

  async findUsable(input: { jti: string; purpose: AuthFlowProofPurpose; subjectId?: string | null }) {
    const conditions = [
      eq(authFlowProofSchema.jti, input.jti),
      eq(authFlowProofSchema.purpose, input.purpose),
      isNull(authFlowProofSchema.consumedAt),
      gt(authFlowProofSchema.expiresAt, new Date()),
    ];
    if (input.subjectId !== undefined && input.subjectId !== null) {
      conditions.push(eq(authFlowProofSchema.subjectId, input.subjectId));
    }

    const [row] = await this.db
      .select()
      .from(authFlowProofSchema)
      .where(and(...conditions))
      .limit(1);
    if (!row) return null;

    return {
      ...row,
      purpose: row.purpose as AuthFlowProofPurpose,
    };
  }

  async consume(input: { jti: string; purpose: AuthFlowProofPurpose; subjectId?: string | null }): Promise<boolean> {
    const conditions = [
      eq(authFlowProofSchema.jti, input.jti),
      eq(authFlowProofSchema.purpose, input.purpose),
      isNull(authFlowProofSchema.consumedAt),
      gt(authFlowProofSchema.expiresAt, new Date()),
    ];
    if (input.subjectId !== undefined && input.subjectId !== null) {
      conditions.push(eq(authFlowProofSchema.subjectId, input.subjectId));
    }

    const rows = await this.db
      .update(authFlowProofSchema)
      .set({ consumedAt: new Date() })
      .where(and(...conditions))
      .returning({ jti: authFlowProofSchema.jti });

    return rows.length === 1;
  }

  async deleteBySubjectId(subjectId: string): Promise<number> {
    const rows = await this.db
      .delete(authFlowProofSchema)
      .where(eq(authFlowProofSchema.subjectId, subjectId))
      .returning({ jti: authFlowProofSchema.jti });

    return rows.length;
  }

  async deleteExpiredBefore(cutoff: Date): Promise<number> {
    const rows = await this.db
      .delete(authFlowProofSchema)
      .where(lt(authFlowProofSchema.expiresAt, cutoff))
      .returning({ jti: authFlowProofSchema.jti });

    return rows.length;
  }
}
