import { forwardRef, Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { ModerationPublicModule } from '@/modules/moderation/public/moderation-public.module';
import { TaxonomyPublicModule } from '@/modules/taxonomy/public/taxonomy-public.module';
import { AccountPublicModule } from '@/modules/account/public/account-public.module';
import { OrganizationPublicModule } from '@/modules/organization/public/organization-public.module';
import { JobAccessService } from './application/policies/job-access.service';
import { JobRepositoriesModule } from './infrastructure/job-repositories.module';
import { JobController } from './presentation/job.controller';
import {
  ListJobsQuery,
  ListMyJobsQuery,
  GetJobQuery,
  ListJobsForManagementQuery,
  ListPendingJobSuggestionsQuery,
  ListMyJobSuggestionsQuery,
} from './application/use-cases/query';
import {
  CreateJobCommand,
  UpdateJobCommand,
  CloseJobCommand,
  RenewJobCommand,
  WithdrawJobCommand,
  DeleteJobCommand,
  SubmitCommunityJobCommand,
  AcceptJobSuggestionCommand,
  RejectJobSuggestionCommand,
} from './application/use-cases/command';

@Module({
  imports: [
    forwardRef(() => AuthPublicModule),
    ModerationPublicModule,
    TaxonomyPublicModule,
    AccountPublicModule,
    OrganizationPublicModule,
    JobRepositoriesModule,
  ],
  providers: [
    JobAccessService,
    ListJobsQuery,
    ListJobsForManagementQuery,
    ListMyJobsQuery,
    GetJobQuery,
    CreateJobCommand,
    UpdateJobCommand,
    CloseJobCommand,
    RenewJobCommand,
    WithdrawJobCommand,
    DeleteJobCommand,
    SubmitCommunityJobCommand,
    AcceptJobSuggestionCommand,
    RejectJobSuggestionCommand,
    ListPendingJobSuggestionsQuery,
    ListMyJobSuggestionsQuery,
  ],
  controllers: [JobController],
  exports: [],
})
export class JobModule {}
