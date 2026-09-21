import { Injectable } from '@nestjs/common';
import { BookmarkRepository } from '@/modules/bookmark/application/bookmarks/bookmark.repository';
import type { BookmarkRecord } from '@/modules/bookmark/application/bookmarks/bookmark.types';

@Injectable()
export class RemoveBookmarkCommand {
  constructor(private readonly bookmarks: BookmarkRepository) {}

  async execute(accountId: string, resourceId: string): Promise<BookmarkRecord> {
    return this.bookmarks.set(accountId, resourceId, false);
  }
}
