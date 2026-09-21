import type {
  ExternalResourceSuggestion,
  ExternalResourceSuggestionStatus,
} from '@/modules/external-resource/domain/external-resource-suggestion';
export abstract class ExternalResourceSuggestionRepository {
  abstract create(suggestion: ExternalResourceSuggestion, context?: unknown): Promise<string>;
  abstract findById(id: string, context?: unknown): Promise<ExternalResourceSuggestion | null>;
  abstract listPending(query: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<{ items: ExternalResourceSuggestion[]; page: number; pageSize: number; total: number }>;
  abstract listBySubmitter(
    accountId: string,
    query: { page?: number; pageSize?: number },
  ): Promise<{ items: ExternalResourceSuggestion[]; page: number; pageSize: number; total: number }>;
  abstract save(
    suggestion: ExternalResourceSuggestion,
    expected?: ExternalResourceSuggestionStatus,
    context?: unknown,
  ): Promise<boolean>;
}
