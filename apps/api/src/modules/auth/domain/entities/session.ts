import { DomainError } from '@/shared/errors/domain-error';

type SessionState = {
  userId: string;
  authMethod: string;
  sessionSecretHash: string;
  lastProofOfPossessionAt?: Date;
  expiresAt: Date;
  revokedAt?: Date | null;
};

export class Session {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly authMethod: string,
    private currentSessionSecretHash: string,
    private currentLastProofOfPossessionAt: Date,
    private currentExpiresAt: Date,
    private revokedAt: Date | null,
  ) {}

  static create(id: string, state: Omit<SessionState, 'revokedAt'>): Session {
    return new Session(
      id,
      state.userId,
      state.authMethod,
      state.sessionSecretHash,
      state.lastProofOfPossessionAt ?? new Date(),
      state.expiresAt,
      null,
    );
  }

  static rehydrate(id: string, state: SessionState): Session {
    return new Session(
      id,
      state.userId,
      state.authMethod,
      state.sessionSecretHash,
      state.lastProofOfPossessionAt ?? new Date(0),
      state.expiresAt,
      state.revokedAt ?? null,
    );
  }

  get sessionSecretHash(): string {
    return this.currentSessionSecretHash;
  }

  get expiresAt(): Date {
    return this.currentExpiresAt;
  }

  get lastProofOfPossessionAt(): Date {
    return this.currentLastProofOfPossessionAt;
  }

  get isRevoked(): boolean {
    return this.revokedAt !== null;
  }

  get revokedAtValue(): Date | null {
    return this.revokedAt;
  }

  get isExpired(): boolean {
    return this.currentExpiresAt.getTime() <= Date.now();
  }

  revoke(at = new Date()): void {
    this.assertActive();
    this.revokedAt = at;
  }

  renewAfterProof(lastProofOfPossessionAt: Date, expiresAt: Date): void {
    this.assertActive();
    if (expiresAt.getTime() <= lastProofOfPossessionAt.getTime()) {
      throw new DomainError('SESSION_INVALID_STATUS');
    }
    this.currentLastProofOfPossessionAt = lastProofOfPossessionAt;
    this.currentExpiresAt = expiresAt;
  }

  private assertActive(): void {
    if (this.isRevoked || this.isExpired) {
      throw new DomainError('SESSION_INVALID_STATUS');
    }
  }
}
