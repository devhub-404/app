import type { TagFollow } from '@/modules/follow/domain/tag-follow';

export type FollowedTagRecord = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export abstract class TagFollowRepository {
  abstract follow(follow: TagFollow): Promise<void>;
  abstract unfollow(accountId: string, tagId: string): Promise<boolean>;
  abstract isFollowing(accountId: string, tagId: string): Promise<boolean>;
  abstract listByAccount(accountId: string): Promise<FollowedTagRecord[]>;
}
