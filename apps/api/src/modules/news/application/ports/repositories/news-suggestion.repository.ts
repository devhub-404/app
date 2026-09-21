import type { NewsSuggestion, NewsSuggestionStatus } from '@/modules/news/domain/news-suggestion';
export abstract class NewsSuggestionRepository {
  abstract create(value: NewsSuggestion): Promise<string>;
  abstract findById(id: string, context?: unknown): Promise<NewsSuggestion | null>;
  abstract findPendingByUrl(url: string): Promise<NewsSuggestion | null>;
  abstract listPending(): Promise<NewsSuggestion[]>;
  abstract listBySubmitter(accountId: string): Promise<NewsSuggestion[]>;
  abstract save(value: NewsSuggestion, expected?: NewsSuggestionStatus, context?: unknown): Promise<boolean>;
}
