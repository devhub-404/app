export type MfaRecoveryCodeRow = {
  id: string;
  userId: string;
  codeHash: string;
  usedAt: Date | null;
  createdAt: Date;
};

export abstract class MfaRecoveryCodeRepository {
  abstract findUnusedByUserIdAndHash(userId: string, codeHash: string): Promise<MfaRecoveryCodeRow | null>;
  abstract listByUserId(userId: string): Promise<MfaRecoveryCodeRow[]>;
  abstract createMany(input: { userId: string; codeHashes: string[] }): Promise<void>;
  abstract consumeUnusedByUserIdAndHash(userId: string, codeHash: string): Promise<MfaRecoveryCodeRow | null>;
  abstract markUsed(id: string): Promise<void>;
  abstract deleteByUserId(userId: string): Promise<void>;
}
