import { Controller, Delete, Get, Param, Post, UseGuards, Version } from '@nestjs/common';
import { AuthGuard, User } from '@/modules/auth/public/http';
import { RoleGuard } from '@/shared/nest/guards/role.guard';
import { FollowTagCommand } from '@/modules/follow/application/use-cases/follow-tag.command';
import { UnfollowTagCommand } from '@/modules/follow/application/use-cases/unfollow-tag.command';
import { ListFollowedTagsQuery } from '@/modules/follow/application/use-cases/list-followed-tags.query';

@Controller('tags')
@UseGuards(AuthGuard, RoleGuard)
export class TagFollowController {
  constructor(
    private readonly followTag: FollowTagCommand,
    private readonly unfollowTag: UnfollowTagCommand,
    private readonly listFollowed: ListFollowedTagsQuery,
  ) {}

  @Version('1')
  @Get('following')
  list(@User('id') accountId: string) {
    return this.listFollowed.execute(accountId);
  }

  @Version('1')
  @Post(':slug/follow')
  follow(@User('id') accountId: string, @Param('slug') slug: string) {
    return this.followTag.execute(accountId, slug);
  }

  @Version('1')
  @Delete(':slug/follow')
  unfollow(@User('id') accountId: string, @Param('slug') slug: string) {
    return this.unfollowTag.execute(accountId, slug);
  }
}
