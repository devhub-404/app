import { DomainError } from '@/shared/errors/domain-error';

export type AccountVoluntaryStatus = 'active' | 'deactivated';
export type AccountModerationStatus = 'none' | 'suspended' | 'banned';
export type AccountDeletionStatus = 'none' | 'pending';

type AccountState = {
  id: string;
  voluntaryStatus: AccountVoluntaryStatus;
  moderationStatus: AccountModerationStatus;
  deletionStatus: AccountDeletionStatus;
  deletionRequestedAt?: Date | null;
  lockedUntil?: Date | null;
};

export class Account {
  private constructor(
    readonly id: string,
    private voluntary: AccountVoluntaryStatus,
    private moderation: AccountModerationStatus,
    private deletion: AccountDeletionStatus,
    private _deletionRequestedAt: Date | null = null,
    private _lockedUntil: Date | null = null,
  ) {}
  static create(id: string): Account {
    return new Account(id, 'active', 'none', 'none');
  }
  static rehydrate(state: AccountState): Account {
    return new Account(
      state.id,
      state.voluntaryStatus,
      state.moderationStatus,
      state.deletionStatus,
      state.deletionRequestedAt ?? null,
      state.lockedUntil ?? null,
    );
  }
  get voluntaryStatus() {
    return this.voluntary;
  }
  get moderationStatus() {
    return this.moderation;
  }
  get deletionStatus() {
    return this.deletion;
  }
  get deletionRequestedAt() {
    return this._deletionRequestedAt;
  }
  get lockedUntil() {
    return this._lockedUntil;
  }
  deactivate(): void {
    if (this.voluntary !== 'active') throw new DomainError('USER_INVALID_STATUS');
    this.voluntary = 'deactivated';
  }
  reactivate(): void {
    if (this.voluntary !== 'deactivated' || this.moderation !== 'none' || this.deletion !== 'none')
      throw new DomainError('USER_INVALID_STATUS');
    this.voluntary = 'active';
  }
  suspend(lockedUntil: Date | null = null): void {
    if (this.moderation !== 'none') throw new DomainError('USER_INVALID_STATUS');
    this.moderation = 'suspended';
    this._lockedUntil = lockedUntil;
  }
  unsuspend(): void {
    if (this.moderation !== 'suspended') throw new DomainError('USER_INVALID_STATUS');
    this.moderation = 'none';
    this._lockedUntil = null;
  }
  ban(): void {
    if (this.moderation === 'banned') throw new DomainError('USER_INVALID_STATUS');
    this.moderation = 'banned';
    this._lockedUntil = null;
  }
  unban(): void {
    if (this.moderation !== 'banned') throw new DomainError('USER_INVALID_STATUS');
    this.moderation = 'none';
    this._lockedUntil = null;
  }
  requestDeletion(requestedAt: Date = new Date()): void {
    if (this.deletion !== 'none') throw new DomainError('USER_INVALID_STATUS');
    this.deletion = 'pending';
    this._deletionRequestedAt = requestedAt;
  }
  cancelDeletion(): void {
    if (this.deletion !== 'pending') throw new DomainError('USER_INVALID_STATUS');
    this.deletion = 'none';
    this._deletionRequestedAt = null;
  }
}
