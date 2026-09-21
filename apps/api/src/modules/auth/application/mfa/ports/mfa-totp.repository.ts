export type MfaTotpRow = {
  id: string;
  userId: string;
  encryptedSecret: string;
  status: 'pending' | 'active' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
};

export type MfaDisabledSnapshot = {
  userId: string;
  encryptedSecret: string;
  recoveryCodes: Array<{ codeHash: string; usedAt: Date | null }>;
};

export abstract class MfaTotpRepository {
  abstract findByUserId(userId: string): Promise<MfaTotpRow | null>;

  abstract upsert(input: {
    userId: string;
    encryptedSecret: string;
    status: 'pending' | 'active' | 'disabled';
  }): Promise<void>;

  abstract activateEnrollment(userId: string, recoveryCodeHashes: string[]): Promise<boolean>;
  abstract disableMfa(userId: string): Promise<MfaDisabledSnapshot | null>;
  abstract restoreDisabledMfa(snapshot: MfaDisabledSnapshot): Promise<void>;
  abstract replaceRecoveryCodes(userId: string, recoveryCodeHashes: string[]): Promise<void>;
  abstract deleteByUserId(userId: string): Promise<void>;
}
