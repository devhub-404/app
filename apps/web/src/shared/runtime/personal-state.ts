import { syncBookmarks as syncBookmarksRemote } from "@/shared/interactions/bookmark/public";
import { syncMyVotes as syncVotesRemote } from "@/shared/interactions/vote/public";
import { backoff, parallel } from "@utilify/core";
import { atom } from "nanostores";
import {
  openLocalDatabase,
  type LocalStoreName,
} from "@/shared/storage/local-database";
import type { IndexedDatabase } from "@/shared/storage/indexeddb";
import {
  getSessionScope,
  isAuthenticatedSessionScope,
  isCurrentSessionScope,
} from "@/features/auth/public/session.ts";
import type { SyncedVote } from "@/shared/interactions/vote/types/vote.type.ts";
import type { BookmarkDTO } from "@/shared/interactions/bookmark/types/bookmark.type.ts";

type StoreName = Extract<LocalStoreName, "votes" | "bookmarks" | "sync-meta">;
type SyncName = Exclude<StoreName, "sync-meta">;
type StoredRow = Record<string, unknown> & { key: string };
type SyncMeta = { key: string; syncedThrough: string };

let revision = 0;
export const $personalStateScope = atom({
  accountId: null as string | null,
  revision,
});
const bootstraps = new Map<string, Promise<void>>();

function publishScope(accountId: string | null) {
  revision += 1;
  $personalStateScope.set({ accountId, revision });
}
const stateKey = (accountId: string, resourceId: string) =>
  `${accountId}:${resourceId}`;
const syncKey = (accountId: string, name: SyncName) => `${accountId}:${name}`;

async function readMeta(
  db: IndexedDatabase,
  accountId: string,
  name: SyncName,
): Promise<string | undefined> {
  try {
    const row = await db
      .useStore<SyncMeta>("sync-meta")
      .get(syncKey(accountId, name));
    return row?.syncedThrough;
  } catch {
    return undefined;
  }
}

async function persist(
  db: IndexedDatabase,
  accountId: string,
  store: SyncName,
  items: StoredRow[],
  syncedThrough: string,
): Promise<void> {
  const transaction = db.transaction([store, "sync-meta"], "readwrite");
  const target = transaction.stores[store];
  if (!target) return;
  for (const item of items) target.put(item);
  transaction.stores["sync-meta"]?.put({
    key: syncKey(accountId, store),
    syncedThrough,
  });
  await transaction.done;
}

async function read(
  db: IndexedDatabase,
  store: SyncName,
  key: string,
): Promise<Record<string, unknown> | undefined> {
  try {
    return await db.useStore<StoredRow>(store).get(key);
  } catch {
    return undefined;
  }
}

async function readCollection<T>(
  db: IndexedDatabase,
  store: SyncName,
  accountId: string,
): Promise<T[]> {
  const prefix = `${accountId}:`;
  const rows = await db.useStore<StoredRow>(store).getAll();
  return rows
    .filter((row) => row.key.startsWith(prefix))
    .map(({ key: _key, ...item }) => item as T);
}

async function syncVotes(
  db: IndexedDatabase,
  accountId: string,
  signal: AbortSignal,
) {
  const updatedAfter = await readMeta(db, accountId, "votes");
  if (signal.aborted) return;
  const response = await syncVotesRemote(updatedAfter, { signal });
  const payload = response.data?.data;
  if (!payload) return;
  await persist(
    db,
    accountId,
    "votes",
    payload.items.map((item) => ({
      ...item,
      key: stateKey(accountId, item.resourceId),
    })),
    payload.syncedThrough,
  );
}

async function syncBookmarks(
  db: IndexedDatabase,
  accountId: string,
  signal: AbortSignal,
) {
  const updatedAfter = await readMeta(db, accountId, "bookmarks");
  if (signal.aborted) return;
  const response = await syncBookmarksRemote(updatedAfter, { signal });
  const payload = response.data?.data;
  if (!payload) return;
  await persist(
    db,
    accountId,
    "bookmarks",
    payload.items.map((item) => ({
      ...item,
      key: stateKey(accountId, item.resourceId),
    })),
    payload.syncedThrough,
  );
}

async function runBootstrapPersonalState(
  accountId: string,
  scope: ReturnType<typeof getSessionScope>,
) {
  if (scope.status !== "authenticated" || scope.accountId !== accountId) return;
  if ($personalStateScope.get().accountId !== accountId)
    publishScope(accountId);
  const db = await openLocalDatabase();
  if (!db) return;
  try {
    if (!isCurrentSessionScope(scope)) return;
    await parallel(
      () =>
        backoff(
          () => {
            if (!isCurrentSessionScope(scope)) return Promise.resolve();
            return syncVotes(db, accountId, scope.signal);
          },
          {
            initialDelay: 400,
            maxAttempts: 3,
            maxDelay: 8_000,
            jitterMode: "full",
          },
        ).catch(() => undefined),
      () =>
        backoff(
          () => {
            if (!isCurrentSessionScope(scope)) return Promise.resolve();
            return syncBookmarks(db, accountId, scope.signal);
          },
          {
            initialDelay: 400,
            maxAttempts: 3,
            maxDelay: 8_000,
            jitterMode: "full",
          },
        ).catch(() => undefined),
    );
    if (
      !isCurrentSessionScope(scope) ||
      $personalStateScope.get().accountId !== accountId
    )
      return;
    publishScope(accountId);
  } finally {
    db.db.close();
  }
}

export function bootstrapPersonalState(accountId: string): Promise<void> {
  const scope = getSessionScope();
  if (scope.status !== "authenticated" || scope.accountId !== accountId)
    return Promise.resolve();

  const key = `${accountId}:${scope.revision}`;
  const existing = bootstraps.get(key);
  if (existing) return existing;

  const task = runBootstrapPersonalState(accountId, scope).finally(() => {
    if (bootstraps.get(key) === task) bootstraps.delete(key);
  });
  bootstraps.set(key, task);
  return task;
}

export async function getPersonalContentState(
  resourceId: string,
): Promise<{ voted: boolean; bookmarked: boolean } | null> {
  const scope = getSessionScope();
  if (scope.status !== "authenticated" || !scope.accountId) return null;
  const accountId = scope.accountId;
  await bootstrapPersonalState(accountId);
  if (!isCurrentSessionScope(scope) || !isAuthenticatedSessionScope(accountId))
    return null;
  const db = await openLocalDatabase();
  if (!db) return null;
  try {
    const key = stateKey(accountId, resourceId);
    const [vote, bookmark] = await Promise.all([
      read(db, "votes", key),
      read(db, "bookmarks", key),
    ]);
    if ($personalStateScope.get().accountId !== accountId) return null;
    return {
      voted: vote?.["active"] === true,
      bookmarked: bookmark?.["active"] === true,
    };
  } finally {
    db.db.close();
  }
}

export async function getPersonalContentStates(
  resourceIds: string[],
): Promise<Record<string, { voted: boolean; bookmarked: boolean }>> {
  const scope = getSessionScope();
  if (
    scope.status !== "authenticated" ||
    !scope.accountId ||
    resourceIds.length === 0
  )
    return {};
  const accountId = scope.accountId;
  await bootstrapPersonalState(accountId);
  if (!isCurrentSessionScope(scope) || !isAuthenticatedSessionScope(accountId))
    return {};
  const db = await openLocalDatabase();
  if (!db) return {};
  try {
    const uniqueIds = [...new Set(resourceIds)];
    const [votes, bookmarks] = await Promise.all([
      Promise.all(
        uniqueIds.map((id) => read(db, "votes", stateKey(accountId, id))),
      ),
      Promise.all(
        uniqueIds.map((id) => read(db, "bookmarks", stateKey(accountId, id))),
      ),
    ]);
    if ($personalStateScope.get().accountId !== accountId) return {};
    return Object.fromEntries(
      uniqueIds.map((id, index) => [
        id,
        {
          voted: votes[index]?.["active"] === true,
          bookmarked: bookmarks[index]?.["active"] === true,
        },
      ]),
    );
  } finally {
    db.db.close();
  }
}

async function getPersonalCollection<T>(store: SyncName): Promise<T[] | null> {
  const accountId = getSessionScope().accountId;
  if (!accountId || !isAuthenticatedSessionScope(accountId)) return null;

  await bootstrapPersonalState(accountId);
  if (!isAuthenticatedSessionScope(accountId)) return null;

  const db = await openLocalDatabase();
  if (!db) return null;
  try {
    return await readCollection<T>(db, store, accountId);
  } catch {
    return null;
  } finally {
    db.db.close();
  }
}

export const getPersonalVotes = (): Promise<SyncedVote[] | null> =>
  getPersonalCollection<SyncedVote>("votes");
export const getPersonalBookmarks = (): Promise<BookmarkDTO[] | null> =>
  getPersonalCollection<BookmarkDTO>("bookmarks");

export async function refreshPersonalState() {
  const scope = getSessionScope();
  const accountId = $personalStateScope.get().accountId;
  if (
    accountId &&
    isAuthenticatedSessionScope(accountId) &&
    isCurrentSessionScope(scope)
  ) {
    await bootstrapPersonalState(accountId);
  }
}

export function clearPersonalState() {
  if ($personalStateScope.get().accountId === null) return;
  publishScope(null);
}
