import { Module } from '@nestjs/common';
import { BookmarkModule } from '@/modules/bookmark/bookmark.module';
@Module({ imports: [BookmarkModule], exports: [BookmarkModule] })
export class BookmarkHttpPublicModule {}
