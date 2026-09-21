import { Injectable } from '@nestjs/common';
import { BookmarkRepository } from '@/modules/bookmark/application/bookmarks/bookmark.repository';
import type { BookmarkRecord } from '@/modules/bookmark/application/bookmarks/bookmark.types';

@Injectable()
export class ListMyBookmarksQuery {
  constructor(private readonly bookmarks: BookmarkRepository) {}
  execute(accountId: string): Promise<BookmarkRecord[]> {
    return this.bookmarks.list(accountId);
  }
}
