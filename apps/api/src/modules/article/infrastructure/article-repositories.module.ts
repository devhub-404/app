import { Module } from '@nestjs/common';
import { ArticleQueryRepository } from '@/modules/article/application/ports/repositories/article.query.repository';
import { ArticleRepository } from '@/modules/article/application/ports/repositories/article.repository';
import { DrizzleArticleQueryRepository } from '@/modules/article/infrastructure/repositories/article.query.repository';
import { DrizzleArticleRepository } from '@/modules/article/infrastructure/repositories/article.repository';
import { TaxonomyPublicModule } from '@/modules/taxonomy/public/taxonomy-public.module';

@Module({
  imports: [TaxonomyPublicModule],
  providers: [
    { provide: ArticleQueryRepository, useClass: DrizzleArticleQueryRepository },
    { provide: ArticleRepository, useClass: DrizzleArticleRepository },
  ],
  exports: [ArticleQueryRepository, ArticleRepository],
})
export class ArticleRepositoriesModule {}
