export type AuthFlowProofPurpose =
  | 'magic_link'
  | 'password_reset'
  | 'password_change'
  | 'possession_proof_email_code'
  | 'mfa_challenge'
  | 'email_change_primary'
  | 'email_change_backup'
  | 'account_recovery'
  | 'account_deletion_restore_access'
  | 'account_reactivation'
  | 'oauth_state'
  | 'passkey_state';

export type AuthFlowProofRow = {
  jti: string;
  purpose: AuthFlowProofPurpose;
  subjectId: string | null;
  codeHash: string | null;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
};

export abstract class AuthFlowProofRepository {
  abstract create(input: {
    jti: string;
    purpose: AuthFlowProofPurpose;
    subjectId?: string | null;
    codeHash?: string | null;
    expiresAt: Date;
  }): Promise<void>;

  abstract findUsable(input: {
    jti: string;
    purpose: AuthFlowProofPurpose;
    subjectId?: string | null;
  }): Promise<AuthFlowProofRow | null>;

  abstract findUsableByCodeHash(input: {
    purpose: AuthFlowProofPurpose;
    subjectId: string;
    codeHash: string;
  }): Promise<AuthFlowProofRow | null>;

  abstract consume(input: { jti: string; purpose: AuthFlowProofPurpose; subjectId?: string | null }): Promise<boolean>;

  abstract deleteExpiredBefore(cutoff: Date): Promise<number>;
  abstract deleteBySubjectId(subjectId: string): Promise<number>;
}
