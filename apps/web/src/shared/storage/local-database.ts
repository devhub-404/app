import { openDatabase, type IndexedDatabase } from './indexeddb';

export const LOCAL_DATABASE_NAME = 'devhub-local';

export const LOCAL_STORE_NAMES = [
  'articles',
  'article-cache',
  'jobs',
  'projects',
  'news',
  'resources',
  'questions',
  'answers',
  'votes',
  'bookmarks',
  'sync-meta',
] as const;

export type LocalStoreName = (typeof LOCAL_STORE_NAMES)[number];

export async function openLocalDatabase(): Promise<IndexedDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return null;
  try {
    return await openDatabase({
      name: LOCAL_DATABASE_NAME,
      version: 4,
      stores: LOCAL_STORE_NAMES.map((name) => ({
        name,
        options: {
          keyPath: name === 'votes' || name === 'bookmarks' || name === 'sync-meta' ? 'key' : 'id',
        },
      })),
      transactionTimeout: 5_000,
    });
  } catch {
    return null;
  }
}

export async function clearSessionPersistence(): Promise<void> {
  const db = await openLocalDatabase();
  if (db) {
    try {
      const transaction = db.transaction(['votes', 'bookmarks', 'sync-meta'], 'readwrite');
      transaction.stores['votes']?.clear();
      transaction.stores['bookmarks']?.clear();
      transaction.stores['sync-meta']?.clear();
      await transaction.done;
    } catch {
      // Persistence is best-effort; the in-memory session state is cleared separately.
    } finally {
      db.db.close();
    }
  }

  if (typeof window === 'undefined') return;

  // Session invalidation must not erase unrelated same-origin storage. The
  // client owns the `devhub` namespace, including legacy dot/dash keys.
  const clearOwnedKeys = (storage: Storage) => {
    const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
      (key): key is string => key !== null && /^(devhub[:.-]|devhub$)/.test(key),
    );
    keys.forEach((key) => storage.removeItem(key));
  };

  try {
    clearOwnedKeys(window.localStorage);
  } catch {
    /* storage can be disabled */
  }
  try {
    clearOwnedKeys(window.sessionStorage);
  } catch {
    /* storage can be disabled */
  }
}

export async function persistLocalEntities<T extends { id: string }>(
  store: Exclude<LocalStoreName, 'votes' | 'bookmarks' | 'sync-meta'>,
  items: T[],
): Promise<void> {
  const db = await openLocalDatabase();
  if (!db || items.length === 0) return;
  try {
    const transaction = db.transaction([store], 'readwrite');
    for (const item of items) transaction.stores[store]?.put(item);
    await transaction.done;
  } finally {
    db.db.close();
  }
}

export async function readLocalEntities<T extends { id: string }>(
  store: Exclude<LocalStoreName, 'votes' | 'bookmarks' | 'sync-meta'>,
): Promise<T[]> {
  const db = await openLocalDatabase();
  if (!db) return [];
  try {
    return await db.useStore<T>(store).getAll();
  } catch {
    return [];
  } finally {
    db.db.close();
  }
}
