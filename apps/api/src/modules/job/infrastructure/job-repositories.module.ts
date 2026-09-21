import { OrganizationPublicModule } from '@/modules/organization/public/organization-public.module';
import { forwardRef, Module } from '@nestjs/common';
import { JobRepository } from '../application/ports/repositories/job.repository';
import { JobQueryRepository } from '../application/ports/repositories/job.query.repository';
import { JobSuggestionRepository } from '../application/ports/repositories/job-suggestion.repository';
import { DrizzleJobRepository } from './repositories/job.repository';
import { DrizzleJobSuggestionRepository } from './repositories/job-suggestion.repository';

@Module({
  imports: [forwardRef(() => OrganizationPublicModule)],
  providers: [
    { provide: JobRepository, useClass: DrizzleJobRepository },
    { provide: JobQueryRepository, useExisting: JobRepository },
    { provide: JobSuggestionRepository, useClass: DrizzleJobSuggestionRepository },
  ],
  exports: [JobRepository, JobQueryRepository, JobSuggestionRepository],
})
export class JobRepositoriesModule {}
