import { Controller, Delete, Get, Param, Put, Query, UseGuards, Version } from '@nestjs/common';
import { AuthGuard, User, type AuthenticatedPrincipalDTO } from '@/modules/auth/public/http';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import { BookmarkDTO, SyncBookmarksQueryDTO, SyncMyBookmarksDTO } from '../application/bookmarks/dtos';
import {
  ListMyBookmarksQuery,
  RemoveBookmarkCommand,
  SaveBookmarkCommand,
  SyncMyBookmarksQuery,
} from '../application/bookmarks';

@Controller()
@UseGuards(AuthGuard)
export class BookmarkController {
  constructor(
    private readonly save: SaveBookmarkCommand,
    private readonly remove: RemoveBookmarkCommand,
    private readonly list: ListMyBookmarksQuery,
    private readonly sync: SyncMyBookmarksQuery,
  ) {}

  @Version('1')
  @Put('bookmarks/:resourceId')
  @AppResponse('BOOKMARK_SAVED', BookmarkDTO)
  saveBookmark(@User('id') accountId: string, @Param('resourceId', ParseUUIDPipe) resourceId: string) {
    return this.save.execute(accountId, resourceId);
  }

  @Version('1')
  @Delete('bookmarks/:resourceId')
  @AppResponse('BOOKMARK_REMOVED', BookmarkDTO)
  removeBookmark(@User('id') accountId: string, @Param('resourceId', ParseUUIDPipe) resourceId: string) {
    return this.remove.execute(accountId, resourceId);
  }

  @Version('1')
  @Get('me/bookmarks/sync')
  @AppResponse('BOOKMARKS_SYNCED', SyncMyBookmarksDTO)
  syncBookmarks(
    @User() user: AuthenticatedPrincipalDTO,
    @Query() query: SyncBookmarksQueryDTO,
  ): Promise<SyncMyBookmarksDTO> {
    return this.sync.execute(user.sub, query.updatedAfter);
  }

  @Version('1')
  @Get('me/bookmarks')
  @AppResponse('BOOKMARKS_LISTED', BookmarkDTO, { isArray: true })
  listBookmarks(@User() user: AuthenticatedPrincipalDTO) {
    return this.list.execute(user.sub);
  }
}
