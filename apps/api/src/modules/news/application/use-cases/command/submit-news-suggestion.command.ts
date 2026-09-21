import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { NewsSuggestionRepository } from '@/modules/news/application/ports/repositories/news-suggestion.repository';
import { NewsSourceRepository } from '@/modules/news/application/ports/repositories/news-source.repository';
import { NewsSuggestion } from '@/modules/news/domain/news-suggestion';
import { SubmitNewsSuggestionDTO } from '@/modules/news/application/dtos/in';
import { NewsSuggestionDTO } from '@/modules/news/application/dtos/out';
@Injectable()
export class SubmitNewsSuggestionCommand {
  constructor(
    private readonly repository: NewsSuggestionRepository,
    private readonly sources: NewsSourceRepository,
  ) {}
  async execute(userId: string, payload: SubmitNewsSuggestionDTO): Promise<NewsSuggestionDTO> {
    const value = NewsSuggestion.create('__new__', payload.url, userId);
    if (await this.sources.findNewsByUrl(value.url)) throw new AppError('NEWS_ALREADY_EXISTS');
    if (await this.repository.findPendingByUrl(value.url)) throw new AppError('NEWS_SUGGESTION_ALREADY_PENDING');
    const id = await this.repository.create(value);

    return {
      id,
      url: value.url,
      submittedByAccountId: userId,
      status: value.status,
      newsId: null,
      createdAt: value.createdAt,
      resolvedAt: null,
    };
  }
}
