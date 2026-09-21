import { forwardRef, Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { NotificationPublicModule } from '@/modules/notification/public/notification-public.module';
import { ModerationController } from './presentation/moderation-reports.controller';
import { AccountRestrictionsController } from './presentation/account-restrictions.controller';
import { RestrictAccountCapabilityCommand } from './application/use-cases/command/restrict-account-capability.command';
import { RevokeAccountRestrictionCommand } from './application/use-cases/command/revoke-account-restriction.command';
import { GetAccountStandingQuery } from './application/use-cases/query/get-account-standing.query';
import { AccountRestrictionPublicModule } from './public/account-restriction-public.module';
import { ArticlePublicModule } from '@/modules/article/public/article-public.module';
import { NewsPublicModule } from '@/modules/news/public/news-public.module';
import { ExternalResourcePublicModule } from '@/modules/external-resource/public/resource-public.module';
import { QAndAPublicModule } from '@/modules/q-and-a/public/q-and-a-public.module';
import { ProjectPublicModule } from '@/modules/project/public/project-public.module';
import { JobPublicModule } from '@/modules/job/public/job-public.module';
import { CommentModerationPublicModule } from '@/modules/comment/public/comment-moderation-public.module';
import { EventPublicModule } from '@/modules/event/public/event-public.module';
import {
  HideCommentCommand,
  HideResourceCommand,
  UnhideCommentCommand,
  UnhideResourceCommand,
} from './application/use-cases/command';
import { ListHiddenTargetsQuery } from './application/use-cases/query/list-hidden-targets.query';
import { ModerationTargetVisibilityPort } from './application/ports/moderation-target-visibility.port';
import { PublicOwnerModerationTargetVisibility } from './infrastructure/repositories/moderation-target-visibility.repository';

@Module({
  imports: [
    forwardRef(() => AuthPublicModule),
    AccountRestrictionPublicModule,
    NotificationPublicModule,
    ArticlePublicModule,
    NewsPublicModule,
    ExternalResourcePublicModule,
    QAndAPublicModule,
    ProjectPublicModule,
    JobPublicModule,
    CommentModerationPublicModule,
    EventPublicModule,
  ],
  providers: [
    RestrictAccountCapabilityCommand,
    RevokeAccountRestrictionCommand,
    GetAccountStandingQuery,
    HideResourceCommand,
    UnhideResourceCommand,
    HideCommentCommand,
    UnhideCommentCommand,
    ListHiddenTargetsQuery,
    { provide: ModerationTargetVisibilityPort, useClass: PublicOwnerModerationTargetVisibility },
  ],
  controllers: [ModerationController, AccountRestrictionsController],
  exports: [AccountRestrictionPublicModule],
})
export class ModerationModule {}
