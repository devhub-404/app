import { Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { SubmitFeedbackCommand } from './application/use-cases/command/submit-feedback.command';
import { FeedbackController } from './presentation/feedback.controller';
import { FeedbackRepository } from './application/ports/feedback.repository';
import { DrizzleFeedbackRepository } from './infrastructure/feedback.repository';
import { ListFeedbackForTriageQuery } from './application/use-cases/query/list-feedback-for-triage.query';
import { UpdateFeedbackStatusCommand } from './application/use-cases/command/update-feedback-status.command';
import { MediaPublicModule } from '@/modules/media/public/media-public.module';

@Module({
  imports: [MediaPublicModule, AuthPublicModule],
  controllers: [FeedbackController],
  providers: [
    SubmitFeedbackCommand,
    ListFeedbackForTriageQuery,
    UpdateFeedbackStatusCommand,
    { provide: FeedbackRepository, useClass: DrizzleFeedbackRepository },
  ],
})
export class FeedbackModule {}
