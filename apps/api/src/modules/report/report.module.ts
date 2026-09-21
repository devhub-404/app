import { Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { CommentModerationPublicModule } from '@/modules/comment/public/comment-moderation-public.module';
import { ArticlePublicModule } from '@/modules/article/public/article-public.module';
import { NewsPublicModule } from '@/modules/news/public/news-public.module';
import { ExternalResourcePublicModule } from '@/modules/external-resource/public/resource-public.module';
import { ProjectPublicModule } from '@/modules/project/public/project-public.module';
import { EventPublicModule } from '@/modules/event/public/event-public.module';
import { JobPublicModule } from '@/modules/job/public/job-public.module';
import { QAndAPublicModule } from '@/modules/q-and-a/public/q-and-a-public.module';
import { ResourceReportTargetAccessService } from './application/resource-report-target-access.service';
import { ReportRepository } from './application/ports/report.repository';
import { DrizzleReportRepository } from './infrastructure/report.repository';
import { CreateResourceReportCommand } from './application/use-cases/create-resource-report.command';
import { CreateCommentReportCommand } from './application/use-cases/create-comment-report.command';
import { ReviewCommentReportCommand, ReviewResourceReportCommand } from './application/use-cases/review-report.command';
import { ListCommentReportsQuery, ListResourceReportsQuery } from './application/use-cases/list-reports.query';
import { ReportController } from './presentation/report.controller';

@Module({
  imports: [
    AuthPublicModule,
    CommentModerationPublicModule,
    ArticlePublicModule,
    NewsPublicModule,
    ExternalResourcePublicModule,
    ProjectPublicModule,
    EventPublicModule,
    JobPublicModule,
    QAndAPublicModule,
  ],
  providers: [
    { provide: ReportRepository, useClass: DrizzleReportRepository },
    ResourceReportTargetAccessService,
    CreateResourceReportCommand,
    CreateCommentReportCommand,
    ReviewResourceReportCommand,
    ReviewCommentReportCommand,
    ListResourceReportsQuery,
    ListCommentReportsQuery,
  ],
  controllers: [ReportController],
})
export class ReportModule {}
