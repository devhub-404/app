import { DomainError } from '@/shared/errors/domain-error';

export type VoteState = {
  accountId: string;
  resourceId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export class Vote {
  private constructor(private readonly state: VoteState) {}

  static create(accountId: string, resourceId: string, at = new Date()): Vote {
    if (!accountId.trim() || !resourceId.trim()) throw new DomainError('VOTE_INVALID_REFERENCE');
    const now = at.toISOString();

    return new Vote({ accountId, resourceId, active: true, createdAt: now, updatedAt: now });
  }

  static rehydrate(state: VoteState): Vote {
    return new Vote({ ...state });
  }
  get value(): VoteState {
    return { ...this.state };
  }

  set(at = new Date()): void {
    this.state.active = true;
    this.state.updatedAt = at.toISOString();
  }
  remove(at = new Date()): void {
    this.state.active = false;
    this.state.updatedAt = at.toISOString();
  }
}
