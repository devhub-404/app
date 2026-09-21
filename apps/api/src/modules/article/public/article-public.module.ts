import { Module } from '@nestjs/common';
import { ArticleRepositoriesModule } from '@/modules/article/infrastructure/article-repositories.module';
import { ArticlePublicService } from '@/modules/article/public/article-public.service';
import { ArticlePublicServicePort } from '@/modules/article/public/article-public.service.port';

@Module({
  imports: [ArticleRepositoriesModule],
  providers: [{ provide: ArticlePublicServicePort, useClass: ArticlePublicService }],
  exports: [ArticlePublicServicePort],
})
export class ArticlePublicModule {}
