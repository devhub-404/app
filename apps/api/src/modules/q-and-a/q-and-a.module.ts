import { forwardRef, Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { ModerationPublicModule } from '@/modules/moderation/public/moderation-public.module';
import { TaxonomyPublicModule } from '@/modules/taxonomy/public/taxonomy-public.module';
import { NotificationPublicModule } from '@/modules/notification/public/notification-public.module';
import { QAndARepositoriesModule } from './infrastructure/q-and-a-repositories.module';
import { QAndAPublicModule } from './public/q-and-a-public.module';
import { QAndAController } from './presentation/q-and-a.controller';
import { AnswersController } from './presentation/answers.controller';
import {
  ListQuestionsQuery,
  GetQuestionQuery,
  ListMyQuestionsQuery,
  ListMyAnswersQuery,
  ListQuestionsForModerationQuery,
} from './application/use-cases/query';
import {
  CreateQuestionCommand,
  CreateAnswerCommand,
  AcceptAnswerCommand,
  RemoveAcceptedAnswerCommand,
  CloseQuestionCommand,
  ReopenQuestionCommand,
  DeleteQuestionCommand,
  DeleteAnswerCommand,
} from './application/use-cases/command';

@Module({
  imports: [
    forwardRef(() => AuthPublicModule),
    ModerationPublicModule,
    TaxonomyPublicModule,
    NotificationPublicModule,
    QAndARepositoriesModule,
    QAndAPublicModule,
  ],
  providers: [
    ListQuestionsQuery,
    GetQuestionQuery,
    ListMyQuestionsQuery,
    ListMyAnswersQuery,
    ListQuestionsForModerationQuery,
    CreateQuestionCommand,
    CreateAnswerCommand,
    AcceptAnswerCommand,
    RemoveAcceptedAnswerCommand,
    CloseQuestionCommand,
    ReopenQuestionCommand,
    DeleteQuestionCommand,
    DeleteAnswerCommand,
  ],
  controllers: [QAndAController, AnswersController],
})
export class QAndAModule {}
