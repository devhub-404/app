import { InteractionBookmarksApi } from "@/shared/interactions/bookmark/api/bookmark.api.ts";
import type { ApiResult } from "@/shared/api";
import type { InteractionRequestOptions } from "@/shared/interactions/vote/actions/vote.action.ts";
import type {
  BookmarkDTO,
  SyncMyBookmarksDTO,
} from "@/shared/interactions/bookmark/types/bookmark.type.ts";
import {
  getSessionScope,
  isAuthenticatedSessionScope,
} from "@/app/session/session-scope";

function withCurrentSession(
  options?: InteractionRequestOptions,
): InteractionRequestOptions | undefined {
  if (options?.signal) return options;
  const scope = getSessionScope();
  return isAuthenticatedSessionScope(scope.accountId)
    ? { signal: scope.signal }
    : options;
}

const authenticationRequired = <T>(): ApiResult<T> => ({
  error: { code: "AUTHENTICATION_REQUIRED" },
});
const emptySync: SyncMyBookmarksDTO = {
  items: [],
  syncedThrough: new Date(0).toISOString(),
};

export const saveBookmark = (
  resourceId: string,
  options?: InteractionRequestOptions,
): Promise<ApiResult<BookmarkDTO>> => {
  if (!isAuthenticatedSessionScope())
    return Promise.resolve(authenticationRequired<BookmarkDTO>());
  return InteractionBookmarksApi.save(resourceId, withCurrentSession(options));
};
export const removeBookmark = (
  resourceId: string,
  options?: InteractionRequestOptions,
): Promise<ApiResult<BookmarkDTO>> => {
  if (!isAuthenticatedSessionScope())
    return Promise.resolve(authenticationRequired<BookmarkDTO>());
  return InteractionBookmarksApi.remove(
    resourceId,
    withCurrentSession(options),
  );
};
export const listBookmarks = (
  options?: InteractionRequestOptions,
): Promise<ApiResult<BookmarkDTO[]>> =>
  isAuthenticatedSessionScope()
    ? InteractionBookmarksApi.list(withCurrentSession(options))
    : Promise.resolve({ data: { data: [] } } as ApiResult<BookmarkDTO[]>);
export const syncBookmarks = (
  updatedAfter?: string,
  options?: InteractionRequestOptions,
): Promise<ApiResult<SyncMyBookmarksDTO>> =>
  isAuthenticatedSessionScope()
    ? InteractionBookmarksApi.sync(updatedAfter, withCurrentSession(options))
    : Promise.resolve({
        data: { data: emptySync },
      } as ApiResult<SyncMyBookmarksDTO>);
