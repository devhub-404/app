import { openLocalDatabase } from '@/shared/storage/local-database';
import type { ArticleDetails, ArticleItem } from '../types/article.type.ts';

type CachedArticle = {
  id: string;
  accountId: string;
  article: ArticleItem | ArticleDetails;
  cachedAt: string;
};

export const ArticleCache = {
  async saveMany(accountId: string, articles: (ArticleItem | ArticleDetails)[]): Promise<void> {
    if (articles.length === 0) return;
    const db = await openLocalDatabase();
    if (!db) return;

    try {
      const transaction = db.transaction(['article-cache'], 'readwrite');
      const store = transaction.stores['article-cache'];
      for (const article of articles) {
        store?.put({
          id: article.id,
          accountId,
          article,
          cachedAt: new Date().toISOString(),
        });
      }
      await transaction.done;
    } finally {
      db.db.close();
    }
  },

  async list(accountId: string): Promise<ArticleItem[]> {
    const db = await openLocalDatabase();
    if (!db) return [];

    try {
      const rows = await db.useStore<CachedArticle>('article-cache').getAll();
      return rows
        .filter((row) => row.accountId === accountId)
        .map((row) => row.article)
        .filter((article): article is ArticleItem => !('content' in article));
    } catch {
      return [];
    } finally {
      db.db.close();
    }
  },

  async get(accountId: string, articleId: string): Promise<ArticleItem | ArticleDetails | null> {
    const db = await openLocalDatabase();
    if (!db) return null;

    try {
      const row = await db.useStore<CachedArticle>('article-cache').get(articleId);
      return row?.accountId === accountId ? row.article : null;
    } catch {
      return null;
    } finally {
      db.db.close();
    }
  },

  async clearAccount(accountId: string): Promise<void> {
    const db = await openLocalDatabase();
    if (!db) return;

    try {
      const rows = await db.useStore<CachedArticle>('article-cache').getAll();
      const transaction = db.transaction(['article-cache'], 'readwrite');
      const store = transaction.stores['article-cache'];
      for (const row of rows) {
        if (row.accountId === accountId) void store?.delete(row.id);
      }
      await transaction.done;
    } finally {
      db.db.close();
    }
  },
};
