import { Module } from '@nestjs/common';
import { NewsQueryRepository } from '@/modules/news/application/ports/repositories/news.query.repository';
import { NewsRepository } from '@/modules/news/application/ports/repositories/news.repository';
import { DrizzleNewsQueryRepository } from '@/modules/news/infrastructure/repositories/news.query.repository';
import { DrizzleNewsRepository } from '@/modules/news/infrastructure/repositories/news.repository';
import { TaxonomyPublicModule } from '@/modules/taxonomy/public/taxonomy-public.module';
import { NewsSuggestionRepository } from '@/modules/news/application/ports/repositories/news-suggestion.repository';
import { NewsSourceRepository } from '@/modules/news/application/ports/repositories/news-source.repository';
import { DrizzleNewsSuggestionRepository } from '@/modules/news/infrastructure/repositories/news-suggestion.repository';
import { DrizzleNewsSourceRepository } from '@/modules/news/infrastructure/repositories/news-source.repository';

@Module({
  imports: [TaxonomyPublicModule],
  providers: [
    { provide: NewsQueryRepository, useClass: DrizzleNewsQueryRepository },
    { provide: NewsRepository, useClass: DrizzleNewsRepository },
    { provide: NewsSuggestionRepository, useClass: DrizzleNewsSuggestionRepository },
    { provide: NewsSourceRepository, useClass: DrizzleNewsSourceRepository },
  ],
  exports: [NewsQueryRepository, NewsRepository, NewsSuggestionRepository, NewsSourceRepository],
})
export class NewsRepositoriesModule {}
