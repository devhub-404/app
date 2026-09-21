import { Module } from '@nestjs/common';
import { NewsRepositoriesModule } from '@/modules/news/infrastructure/news-repositories.module';
import { NewsPublicService } from '@/modules/news/public/news-public.service';
import { NewsPublicServicePort } from '@/modules/news/public/news-public.service.port';

@Module({
  imports: [NewsRepositoriesModule],
  providers: [{ provide: NewsPublicServicePort, useClass: NewsPublicService }],
  exports: [NewsPublicServicePort],
})
export class NewsPublicModule {}
