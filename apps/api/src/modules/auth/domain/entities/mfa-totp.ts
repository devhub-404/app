import { DomainError } from '@/shared/errors/domain-error';

export type MfaTotpStatus = 'pending' | 'active' | 'disabled';

type MfaTotpState = {
  id: string;
  userId: string;
  encryptedSecret: string;
  status: MfaTotpStatus;
  createdAt?: Date;
  updatedAt?: Date;
};

export class MfaTotp {
  private constructor(
    readonly id: string,
    readonly userId: string,
    private _encryptedSecret: string,
    private _status: MfaTotpStatus,
  ) {}

  static createPending(userId: string, encryptedSecret: string): MfaTotp {
    return new MfaTotp(userId, userId, encryptedSecret, 'pending');
  }

  static rehydrate(state: MfaTotpState): MfaTotp {
    return new MfaTotp(state.id, state.userId, state.encryptedSecret, state.status);
  }

  get encryptedSecret(): string {
    return this._encryptedSecret;
  }

  get status(): MfaTotpStatus {
    return this._status;
  }

  activate(): void {
    if (this._status !== 'pending') throw new DomainError('AUTH_INVALID_CREDENTIAL');
    this._status = 'active';
  }

  disable(): void {
    if (this._status !== 'active') throw new DomainError('AUTH_MFA_NOT_ENABLED');
    this._status = 'disabled';
  }
}
