import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { NewsSuggestionRepository } from '@/modules/news/application/ports/repositories/news-suggestion.repository';
import { NewsSourceRepository } from '@/modules/news/application/ports/repositories/news-source.repository';
import { NewsRepository } from '@/modules/news/application/ports/repositories/news.repository';
import { NewsPolicy } from '@/modules/news/application/news.policy';
import { News } from '@/modules/news/domain/news';
import { NewsSuggestionStatus } from '@/modules/news/domain/news-suggestion';
import { AcceptNewsSuggestionDTO } from '@/modules/news/application/dtos/in';
import { resolveUniqueSlug } from '@/shared/kernel/slug/unique-slug';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';
@Injectable()
export class AcceptNewsSuggestionCommand {
  constructor(
    private readonly suggestions: NewsSuggestionRepository,
    private readonly news: NewsRepository,
    private readonly sources: NewsSourceRepository,
    private readonly policy: NewsPolicy,
    private readonly identities: ResourceIdentityPort,
  ) {}
  async execute(user: User, id: string, payload: AcceptNewsSuggestionDTO): Promise<void> {
    this.policy.canManage(user);
    await this.news.transaction(async (context) => {
      const suggestion = await this.suggestions.findById(id, context);
      if (!suggestion) throw new AppError('NEWS_SUGGESTION_NOT_FOUND');
      let newsId = payload.newsId;
      if (newsId) {
        if (!(await this.news.findById(newsId, context))) throw new AppError('NEWS_NOT_FOUND');
      } else {
        if (!payload.title || !payload.description || !payload.content)
          throw new AppError('NEWS_SUGGESTION_DRAFT_REQUIRED');
        const identity = await this.identities.create('news', context);
        const draft = News.create(identity.id, {
          title: payload.title,
          description: payload.description,
          content: payload.content,
          slug: await resolveUniqueSlug(
            payload.title,
            (slug) => this.news.slugExists(slug, undefined, context),
            80,
            'news',
          ),
        });
        newsId = await this.news.create(draft, undefined, context);
      }
      suggestion.accept(newsId, user.sub);
      if (!(await this.suggestions.save(suggestion, NewsSuggestionStatus.Pending, context)))
        throw new AppError('NEWS_SUGGESTION_INVALID_STATUS');
      await this.sources.link(newsId, suggestion.url, undefined, context);
    });
  }
}
