import { Injectable } from '@nestjs/common';
import { BookmarkRepository } from '@/modules/bookmark/application/bookmarks/bookmark.repository';
import { SyncMyBookmarksDTO } from '@/modules/bookmark/application/bookmarks/dtos';

@Injectable()
export class SyncMyBookmarksQuery {
  constructor(private readonly bookmarks: BookmarkRepository) {}
  async execute(accountId: string, updatedAfter?: string): Promise<SyncMyBookmarksDTO> {
    const syncedThrough = new Date().toISOString();
    const items = await this.bookmarks.sync(accountId, syncedThrough, updatedAfter);

    return { items, syncedThrough };
  }
}
