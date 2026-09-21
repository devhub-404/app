import { DomainError } from '@/shared/errors/domain-error';

export type BookmarkState = {
  accountId: string;
  resourceId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export class Bookmark {
  private constructor(private readonly state: BookmarkState) {}

  static create(accountId: string, resourceId: string, at = new Date()): Bookmark {
    if (!accountId.trim() || !resourceId.trim()) throw new DomainError('BOOKMARK_INVALID_REFERENCE');
    const now = at.toISOString();

    return new Bookmark({ accountId, resourceId, active: true, createdAt: now, updatedAt: now });
  }

  static rehydrate(state: BookmarkState): Bookmark {
    return new Bookmark({ ...state });
  }
  get value(): BookmarkState {
    return { ...this.state };
  }

  save(at = new Date()): void {
    this.state.active = true;
    this.state.updatedAt = at.toISOString();
  }
  remove(at = new Date()): void {
    this.state.active = false;
    this.state.updatedAt = at.toISOString();
  }
}
