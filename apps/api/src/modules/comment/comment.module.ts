import { forwardRef, Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { ModerationPublicModule } from '@/modules/moderation/public/moderation-public.module';
import { ArticlePublicModule } from '@/modules/article/public/article-public.module';
import { NewsPublicModule } from '@/modules/news/public/news-public.module';
import { CommentTargetAccessService } from '@/modules/comment/application/comments/comment-target-access.service';
import { NotificationPublicModule } from '@/modules/notification/public/notification-public.module';
import { CommentRepositoriesModule } from '@/modules/comment/infrastructure/comments/comment-repositories.module';
import { CommentsController } from '@/modules/comment/presentation/comments.controller';
import { DomainCommentsController } from '@/modules/comment/presentation/domain-comments.controller';
import { CommentsPolicy } from '@/modules/comment/application/comments/comments.policy';
import { ListCommentsQuery } from '@/modules/comment/application/use-cases/query/list-comments.query';
import { ListHiddenCommentsQuery } from '@/modules/comment/application/use-cases/query/list-hidden-comments.query';
import { CreateCommentCommand } from '@/modules/comment/application/use-cases/command/create-comment.command';
import { UpdateCommentCommand } from '@/modules/comment/application/use-cases/command/update-comment.command';
import { HideCommentCommand } from '@/modules/comment/application/use-cases/command/hide-comment.command';
import { DeleteCommentCommand } from '@/modules/comment/application/use-cases/command/delete-comment.command';
import { UnhideCommentCommand } from '@/modules/comment/application/use-cases/command/unhide-comment.command';
import { GetCommentQuery } from '@/modules/comment/application/use-cases/query/get-comment.query';
import { ListMyCommentsQuery } from '@/modules/comment/application/use-cases/query/list-my-comments.query';
import { ListCommentsForModerationQuery } from '@/modules/comment/application/use-cases/query/list-comments-for-moderation.query';
import { RebuildCommentStatisticsCommand } from '@/modules/comment/application/use-cases/command/rebuild-comment-statistics.command';

@Module({
  imports: [
    AuthPublicModule,
    CommentRepositoriesModule,
    ArticlePublicModule,
    NewsPublicModule,
    NotificationPublicModule,
    forwardRef(() => ModerationPublicModule),
  ],
  providers: [
    ListCommentsQuery,
    ListHiddenCommentsQuery,
    CreateCommentCommand,
    UpdateCommentCommand,
    HideCommentCommand,
    DeleteCommentCommand,
    UnhideCommentCommand,
    GetCommentQuery,
    ListMyCommentsQuery,
    ListCommentsForModerationQuery,
    RebuildCommentStatisticsCommand,
    CommentsPolicy,
    CommentTargetAccessService,
  ],
  controllers: [CommentsController, DomainCommentsController],
})
export class CommentModule {}
