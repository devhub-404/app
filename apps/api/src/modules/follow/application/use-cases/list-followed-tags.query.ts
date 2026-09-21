import { Injectable } from '@nestjs/common';
import { TagFollowRepository } from '../ports/tag-follow.repository';

@Injectable()
export class ListFollowedTagsQuery {
  constructor(private readonly follows: TagFollowRepository) {}
  execute(accountId: string) {
    return this.follows.listByAccount(accountId);
  }
}
