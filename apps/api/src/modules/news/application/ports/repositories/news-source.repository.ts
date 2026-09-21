export abstract class NewsSourceRepository {
  abstract link(newsId: string, url: string, name?: string, context?: unknown): Promise<void>;
  abstract hasForNews(newsId: string): Promise<boolean>;
  abstract findNewsByUrl(url: string): Promise<string | null>;
}
