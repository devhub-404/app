import { Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { AccountRestrictionPublicModule } from '@/modules/moderation/public/account-restriction-public.module';
import { ArticlePublicModule } from '@/modules/article/public/article-public.module';
import { ExternalResourcePublicModule } from '@/modules/external-resource/public/resource-public.module';
import { NewsPublicModule } from '@/modules/news/public/news-public.module';
import { ProjectPublicModule } from '@/modules/project/public/project-public.module';
import { QAndAPublicModule } from '@/modules/q-and-a/public/q-and-a-public.module';
import { BookmarkTargetAccessService } from './application/bookmarks/bookmark-target-access.service';
import { BookmarkRepository } from './application/bookmarks/bookmark.repository';
import { DrizzleBookmarkRepository } from './infrastructure/bookmarks/bookmark.repository';
import {
  ListMyBookmarksQuery,
  RemoveBookmarkCommand,
  SaveBookmarkCommand,
  SyncMyBookmarksQuery,
} from './application/bookmarks';
import { BookmarkController } from './presentation/bookmark.controller';

@Module({
  imports: [
    AuthPublicModule,
    AccountRestrictionPublicModule,
    ArticlePublicModule,
    NewsPublicModule,
    ExternalResourcePublicModule,
    ProjectPublicModule,
    QAndAPublicModule,
  ],
  providers: [
    { provide: BookmarkRepository, useClass: DrizzleBookmarkRepository },
    ListMyBookmarksQuery,
    RemoveBookmarkCommand,
    SaveBookmarkCommand,
    SyncMyBookmarksQuery,
    BookmarkTargetAccessService,
  ],
  controllers: [BookmarkController],
  exports: [
    BookmarkRepository,
    ListMyBookmarksQuery,
    RemoveBookmarkCommand,
    SaveBookmarkCommand,
    SyncMyBookmarksQuery,
    BookmarkTargetAccessService,
  ],
})
export class BookmarkModule {}
