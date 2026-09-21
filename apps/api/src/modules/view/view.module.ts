import { Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { ArticlePublicModule } from '@/modules/article/public/article-public.module';
import { NewsPublicModule } from '@/modules/news/public/news-public.module';
import { ViewTargetAccessService } from './application/views/view-target-access.service';
import { ViewRepository } from './application/views/view.repository';
import { ViewStatisticsRepository } from './application/views/view-statistics.repository';
import { DrizzleViewRepository } from './infrastructure/view.repository';
import { DrizzleViewStatisticsRepository } from './infrastructure/view-statistics.repository';
import { RecordViewCommand } from './application/use-cases/command/record-view.command';
import { ViewController } from './presentation/view.controller';

@Module({
  imports: [AuthPublicModule, ArticlePublicModule, NewsPublicModule],
  providers: [
    { provide: ViewRepository, useClass: DrizzleViewRepository },
    { provide: ViewStatisticsRepository, useClass: DrizzleViewStatisticsRepository },
    RecordViewCommand,
    ViewTargetAccessService,
  ],
  controllers: [ViewController],
})
export class ViewModule {}
