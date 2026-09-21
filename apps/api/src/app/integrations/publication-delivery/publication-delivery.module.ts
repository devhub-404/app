import { Injectable, Module } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ARTICLE_PUBLISHED_EVENT, ArticlePublishedEvent } from '@/modules/article/public/article-published.event';
import { NEWS_PUBLISHED_EVENT, NewsPublishedEvent } from '@/modules/news/public/news-published.event';
import { DiscordPublicationDeliveryService } from './discord-publication-delivery.service';
import { PublicationDeliveryPort } from './publication-delivery.port';

@Injectable()
class ArticlePublicationListener {
  constructor(private readonly delivery: PublicationDeliveryPort) {}

  @OnEvent(ARTICLE_PUBLISHED_EVENT)
  handle(event: ArticlePublishedEvent): Promise<void> {
    return this.delivery.tryPublish(event.message);
  }
}

@Injectable()
class NewsPublicationListener {
  constructor(private readonly delivery: PublicationDeliveryPort) {}

  @OnEvent(NEWS_PUBLISHED_EVENT)
  handle(event: NewsPublishedEvent): Promise<void> {
    return this.delivery.tryPublish(event.message);
  }
}

@Module({
  providers: [
    DiscordPublicationDeliveryService,
    { provide: PublicationDeliveryPort, useExisting: DiscordPublicationDeliveryService },
    ArticlePublicationListener,
    NewsPublicationListener,
  ],
})
export class PublicationDeliveryModule {}
