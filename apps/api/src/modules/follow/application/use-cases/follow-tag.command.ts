import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public';
import { TagFollow } from '@/modules/follow/domain/tag-follow';
import { TagFollowRepository } from '../ports/tag-follow.repository';

@Injectable()
export class FollowTagCommand {
  constructor(
    private readonly tags: TaxonomyPublicServicePort,
    private readonly follows: TagFollowRepository,
  ) {}

  async execute(accountId: string, slug: string): Promise<void> {
    const tag = await this.tags.getTagBySlug(slug);
    if (!tag || tag.status !== 'active') throw new AppError('TAG_NOT_FOUND');
    if (await this.follows.isFollowing(accountId, tag.id)) return;
    await this.follows.follow(TagFollow.create(accountId, tag.id));
  }
}
