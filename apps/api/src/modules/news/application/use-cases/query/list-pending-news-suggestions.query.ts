import { Inject, Injectable } from '@nestjs/common';
import { NewsSuggestionRepository } from '@/modules/news/application/ports/repositories/news-suggestion.repository';
import { NewsSuggestionDTO } from '@/modules/news/application/dtos/out/news-suggestion.dto';

@Injectable()
export class ListPendingNewsSuggestionsQuery {
  constructor(@Inject(NewsSuggestionRepository) private readonly repository: NewsSuggestionRepository) {}

  async execute(): Promise<NewsSuggestionDTO[]> {
    const suggestions = await this.repository.listPending();

    return suggestions.map((suggestion) => ({
      id: suggestion.id,
      url: suggestion.url,
      submittedByAccountId: suggestion.submittedByAccountId,
      status: suggestion.status,
      newsId: suggestion.acceptedNewsId,
      createdAt: suggestion.createdAt,
      resolvedAt: suggestion.decidedAt,
    }));
  }
}
