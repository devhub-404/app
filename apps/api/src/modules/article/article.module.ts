import { forwardRef, Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { ArticlesController } from '@/modules/article/presentation/article/articles.controller';
import {
  ArticlePolicy,
  SaveArticleDraftCommand,
  DeleteArticleCommand,
  GetArticleBySlugQuery,
  GetArticleByIdQuery,
  GetArticleContentByIdQuery,
  GetArticleContentBySlugQuery,
  PublishArticleCommand,
  ArchiveArticleCommand,
  UnarchiveArticleCommand,
  ListArticlesQuery,
  ListArticlesForModerationQuery,
  ListMyArticlesQuery,
  ListArticleRssQuery,
  ListPopularArticleTagsQuery,
  UpdateArticleCommand,
  SetArticleCommentsEnabledCommand,
} from '@/modules/article/application';
import { ArticleRepositoriesModule } from '@/modules/article/infrastructure/article-repositories.module';
import { TaxonomyPublicModule } from '@/modules/taxonomy/public/taxonomy-public.module';
import { MediaPublicModule } from '@/modules/media/public/media-public.module';
import { ModerationPublicModule } from '@/modules/moderation/public/moderation-public.module';
import { ArticleDetailProjection } from '@/modules/article/application/article-detail-projection';

@Module({
  imports: [
    forwardRef(() => AuthPublicModule),
    ArticleRepositoriesModule,
    TaxonomyPublicModule,
    MediaPublicModule,
    ModerationPublicModule,
  ],
  providers: [
    ListArticlesQuery,
    ListArticlesForModerationQuery,
    GetArticleByIdQuery,
    GetArticleContentByIdQuery,
    GetArticleContentBySlugQuery,
    GetArticleBySlugQuery,
    ListMyArticlesQuery,
    ListArticleRssQuery,
    ListPopularArticleTagsQuery,
    SaveArticleDraftCommand,
    PublishArticleCommand,
    ArchiveArticleCommand,
    UnarchiveArticleCommand,
    UpdateArticleCommand,
    SetArticleCommentsEnabledCommand,
    DeleteArticleCommand,
    ArticlePolicy,
    ArticleDetailProjection,
  ],
  controllers: [ArticlesController],
})
export class ArticleModule {}
