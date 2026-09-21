import { Injectable } from '@nestjs/common';
import { ListArticlesQuery } from './list-articles.query';

export type ArticleRssItem = { title: string; description: string; slug: string; publishedAt: string };

@Injectable()
export class ListArticleRssQuery {
  constructor(private readonly articles: ListArticlesQuery) {}

  async execute(limit = 50): Promise<ArticleRssItem[]> {
    const page = await this.articles.execute({ page: 1, pageSize: Math.min(100, Math.max(1, limit)) });

    return page.items.flatMap((item) =>
      item.publishedAt
        ? [{ title: item.title, description: item.description, slug: item.slug, publishedAt: item.publishedAt }]
        : [],
    );
  }
}
