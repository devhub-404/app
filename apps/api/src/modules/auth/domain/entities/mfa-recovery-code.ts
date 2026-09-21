import { DomainError } from '@/shared/errors/domain-error';

export class MfaRecoveryCode {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly codeHash: string,
    private usedAt: Date | null,
  ) {}

  static rehydrate(state: { id: string; userId?: string; codeHash?: string; usedAt?: Date | null }): MfaRecoveryCode {
    return new MfaRecoveryCode(state.id, state.userId ?? '', state.codeHash ?? '', state.usedAt ?? null);
  }

  get isUsed(): boolean {
    return this.usedAt !== null;
  }

  consume(at = new Date()): void {
    if (this.isUsed) throw new DomainError('AUTH_INVALID_CREDENTIAL');
    this.usedAt = at;
  }
}
