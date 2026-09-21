import { Injectable } from '@nestjs/common';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public';
import { TagFollowRepository } from '../ports/tag-follow.repository';

@Injectable()
export class UnfollowTagCommand {
  constructor(
    private readonly tags: TaxonomyPublicServicePort,
    private readonly follows: TagFollowRepository,
  ) {}

  async execute(accountId: string, slug: string): Promise<void> {
    const tag = await this.tags.getTagBySlug(slug);
    if (!tag) return;
    await this.follows.unfollow(accountId, tag.id);
  }
}
