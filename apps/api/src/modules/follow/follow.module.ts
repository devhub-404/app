import { Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { TaxonomyPublicModule } from '@/modules/taxonomy/public/taxonomy-public.module';
import { TagFollowRepository } from './application/ports/tag-follow.repository';
import { DrizzleTagFollowRepository } from './infrastructure/tag-follow.repository';
import { FollowTagCommand } from './application/use-cases/follow-tag.command';
import { UnfollowTagCommand } from './application/use-cases/unfollow-tag.command';
import { ListFollowedTagsQuery } from './application/use-cases/list-followed-tags.query';
import { TagFollowController } from './presentation/tag-follow.controller';

@Module({
  imports: [AuthPublicModule, TaxonomyPublicModule],
  providers: [
    { provide: TagFollowRepository, useClass: DrizzleTagFollowRepository },
    FollowTagCommand,
    UnfollowTagCommand,
    ListFollowedTagsQuery,
  ],
  controllers: [TagFollowController],
  exports: [TagFollowRepository, ListFollowedTagsQuery],
})
export class FollowModule {}
