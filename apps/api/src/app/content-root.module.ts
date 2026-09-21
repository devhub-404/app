import { Module } from '@nestjs/common';
import { ArticleHttpPublicModule } from '@/modules/article/public';
import { NewsHttpPublicModule } from '@/modules/news/public';
import { ExternalResourceHttpPublicModule } from '@/modules/external-resource/public';
import { VoteHttpPublicModule } from '@/modules/vote/public';
import { BookmarkHttpPublicModule } from '@/modules/bookmark/public';
import { ViewHttpPublicModule } from '@/modules/view/public';
import { CommentHttpPublicModule } from '@/modules/comment/public';
import { ModerationPublicModule } from '@/modules/moderation/public';
import { TaxonomyHttpPublicModule } from '@/modules/taxonomy/public';
import { DiscoveryHttpPublicModule } from '@/modules/discovery/public';
import { QAndAHttpPublicModule } from '@/modules/q-and-a/public';
import { JobHttpPublicModule } from '@/modules/job/public';
import { ProjectHttpPublicModule } from '@/modules/project/public';
import { EventHttpPublicModule } from '@/modules/event/public';
import { OrganizationHttpPublicModule } from '@/modules/organization/public/http-public.module';
import { FollowHttpPublicModule } from '@/modules/follow/public';
import { ReportHttpPublicModule } from '@/modules/report/public';

@Module({
  imports: [
    VoteHttpPublicModule,
    BookmarkHttpPublicModule,
    ViewHttpPublicModule,
    CommentHttpPublicModule,
    ModerationPublicModule,
    ArticleHttpPublicModule,
    NewsHttpPublicModule,
    ExternalResourceHttpPublicModule,
    TaxonomyHttpPublicModule,
    DiscoveryHttpPublicModule,
    QAndAHttpPublicModule,
    JobHttpPublicModule,
    ProjectHttpPublicModule,
    EventHttpPublicModule,
    OrganizationHttpPublicModule,
    FollowHttpPublicModule,
    ReportHttpPublicModule,
  ],
})
export class ContentRootModule {}
