import { DomainError } from '@/shared/errors/domain-error';

export type TagFollowState = {
  accountId: string;
  tagId: string;
  createdAt: string;
};

export class TagFollow {
  private constructor(private readonly state: TagFollowState) {}

  static create(accountId: string, tagId: string, at = new Date()): TagFollow {
    if (!accountId.trim() || !tagId.trim()) throw new DomainError('TAG_FOLLOW_INVALID_REFERENCE');

    return new TagFollow({ accountId, tagId, createdAt: at.toISOString() });
  }

  static rehydrate(state: TagFollowState): TagFollow {
    return new TagFollow({ ...state });
  }
  get value(): TagFollowState {
    return { ...this.state };
  }
}
