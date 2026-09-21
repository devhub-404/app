import { Injectable } from '@nestjs/common';
import { ListNewsQuery } from './list-news.query';

export type NewsRssItem = { title: string; description: string; slug: string; publishedAt: string };

@Injectable()
export class ListNewsRssQuery {
  constructor(private readonly news: ListNewsQuery) {}

  async execute(limit = 50): Promise<NewsRssItem[]> {
    const page = await this.news.execute({ page: 1, pageSize: Math.min(100, Math.max(1, limit)) });

    return page.items.flatMap((item) =>
      item.publishedAt
        ? [{ title: item.title, description: item.description, slug: item.slug, publishedAt: item.publishedAt }]
        : [],
    );
  }
}
