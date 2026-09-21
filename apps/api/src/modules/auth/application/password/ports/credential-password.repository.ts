export type CredentialPasswordRow = {
  credentialId: string;
  userId: string;
  verifier: string;
  opaqueUserIdentifier: string;
  scheme: string;
  failedAttempts: number;
  lockedUntil: Date | null;
};

export abstract class CredentialPasswordRepository {
  abstract findByUserId(userId: string): Promise<CredentialPasswordRow | null>;
  abstract create(input: { credentialId: string; verifier: string; opaqueUserIdentifier: string }): Promise<void>;
  abstract updateVerifier(credentialId: string, verifier: string): Promise<void>;
  abstract resetFailedAttempts(credentialId: string): Promise<void>;
  abstract incrementFailedAttempts(credentialId: string): Promise<void>;
  abstract setLockedUntil(credentialId: string, lockedUntil: Date | null): Promise<void>;
}
