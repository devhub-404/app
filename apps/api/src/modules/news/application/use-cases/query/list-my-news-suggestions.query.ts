import { Injectable } from '@nestjs/common';
import { NewsSuggestionRepository } from '@/modules/news/application/ports/repositories/news-suggestion.repository';
import { NewsSuggestionDTO } from '@/modules/news/application/dtos/out/news-suggestion.dto';

@Injectable()
export class ListMyNewsSuggestionsQuery {
  constructor(private readonly repository: NewsSuggestionRepository) {}

  async execute(accountId: string): Promise<NewsSuggestionDTO[]> {
    const suggestions = await this.repository.listBySubmitter(accountId);

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
