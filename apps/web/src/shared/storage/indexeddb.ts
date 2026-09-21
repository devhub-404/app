import openIndexedDB from 'indexeddb-promisify';

type Store<T> = {
  get(key: IDBValidKey | IDBKeyRange): Promise<T>;
  getAll(): Promise<T[]>;
  put(value: T, key?: IDBValidKey): Promise<IDBValidKey>;
  delete(key: IDBValidKey | IDBKeyRange): Promise<void>;
  clear(): Promise<void>;
};
export type IndexedDatabase = {
  db: IDBDatabase;
  useStore<T>(name: string): Store<T>;
  transaction(
    storeNames: string[],
    mode?: IDBTransactionMode,
  ): {
    stores: Record<string, Store<Record<string, unknown>>>;
    done: Promise<void>;
  };
};
type IndexedDBConfig = Parameters<typeof openIndexedDB>[0];

export function openDatabase(config: IndexedDBConfig): Promise<IndexedDatabase> {
  return openIndexedDB(config);
}
