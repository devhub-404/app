import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { NewsSuggestionRepository } from '@/modules/news/application/ports/repositories/news-suggestion.repository';
import { NewsPolicy } from '@/modules/news/application/news.policy';
import type { User } from '@/shared/kernel/auth/authenticated-user';
@Injectable()
export class RejectNewsSuggestionCommand {
  constructor(
    private readonly repository: NewsSuggestionRepository,
    private readonly policy: NewsPolicy,
  ) {}
  async execute(user: User, id: string): Promise<void> {
    this.policy.canManage(user);
    const value = await this.repository.findById(id);
    if (!value) throw new AppError('NEWS_SUGGESTION_NOT_FOUND');
    value.reject(user.sub);
    if (!(await this.repository.save(value))) throw new AppError('NEWS_SUGGESTION_INVALID_STATUS');
  }
}
