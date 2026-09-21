import type { BookmarkRecord } from './bookmark.types';

export abstract class BookmarkRepository {
  abstract set(accountId: string, resourceId: string, active: boolean): Promise<BookmarkRecord>;
  abstract list(accountId: string): Promise<BookmarkRecord[]>;
  abstract sync(accountId: string, syncedThrough: string, updatedAfter?: string): Promise<BookmarkRecord[]>;
  abstract deleteByAccountId(accountId: string): Promise<number>;
  abstract deleteByResourceId(resourceId: string): Promise<number>;
}
