import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { BookmarkRepository } from '@/modules/bookmark/application/bookmarks/bookmark.repository';
import type { BookmarkRecord } from '@/modules/bookmark/application/bookmarks/bookmark.types';
import { BookmarkTargetAccessService } from '@/modules/bookmark/application/bookmarks/bookmark-target-access.service';

@Injectable()
export class SaveBookmarkCommand {
  constructor(
    private readonly bookmarks: BookmarkRepository,
    private readonly access: BookmarkTargetAccessService,
  ) {}

  async execute(accountId: string, resourceId: string): Promise<BookmarkRecord> {
    if (!(await this.access.isBookmarkable(resourceId))) throw new AppError('BOOKMARK_TARGET_NOT_FOUND');

    return this.bookmarks.set(accountId, resourceId, true);
  }
}
