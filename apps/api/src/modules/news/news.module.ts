import { forwardRef, Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { NewsController } from '@/modules/news/presentation/news.controller';
import {
  ArchiveNewsCommand,
  SaveNewsDraftCommand,
  DeleteNewsCommand,
  GetNewsBySlugQuery,
  GetNewsByIdQuery,
  NewsPolicy,
  PublishNewsCommand,
  ListNewsQuery,
  ListNewsForManagementQuery,
  UnarchiveNewsCommand,
  UpdateNewsCommand,
  ListPopularNewsSourcesQuery,
  SubmitNewsSuggestionCommand,
  AcceptNewsSuggestionCommand,
  RejectNewsSuggestionCommand,
  ListPendingNewsSuggestionsQuery,
  ListMyNewsSuggestionsQuery,
  ListNewsRssQuery,
  SetNewsCommentsEnabledCommand,
} from '@/modules/news/application';
import { NewsRepositoriesModule } from '@/modules/news/infrastructure/news-repositories.module';
import { TaxonomyPublicModule } from '@/modules/taxonomy/public/taxonomy-public.module';
import { MediaPublicModule } from '@/modules/media/public/media-public.module';
import { ModerationPublicModule } from '@/modules/moderation/public/moderation-public.module';

@Module({
  imports: [
    forwardRef(() => AuthPublicModule),
    NewsRepositoriesModule,
    TaxonomyPublicModule,
    MediaPublicModule,
    ModerationPublicModule,
  ],
  providers: [
    ListNewsQuery,
    ListNewsForManagementQuery,
    GetNewsByIdQuery,
    GetNewsBySlugQuery,
    SaveNewsDraftCommand,
    PublishNewsCommand,
    ArchiveNewsCommand,
    UnarchiveNewsCommand,
    UpdateNewsCommand,
    ListPopularNewsSourcesQuery,
    SubmitNewsSuggestionCommand,
    AcceptNewsSuggestionCommand,
    RejectNewsSuggestionCommand,
    ListPendingNewsSuggestionsQuery,
    ListMyNewsSuggestionsQuery,
    ListNewsRssQuery,
    DeleteNewsCommand,
    NewsPolicy,
    SetNewsCommentsEnabledCommand,
  ],
  controllers: [NewsController],
})
export class NewsModule {}
