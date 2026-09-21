import { forwardRef, Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { ModerationPublicModule } from '@/modules/moderation/public/moderation-public.module';
import { TaxonomyPublicModule } from '@/modules/taxonomy/public/taxonomy-public.module';
import { ProjectAccessService } from './application/policies/project-access.service';
import { ProjectRepositoriesModule } from './infrastructure/project-repositories.module';
import { ProjectController } from './presentation/project.controller';
import { HandleProjectAccountDeletionRequestedListener } from './application/handle-account-deletion-requested.listener';
import {
  ListProjectsQuery,
  ListMyProjectsQuery,
  GetProjectBySlugQuery,
  GetProjectByIdQuery,
  ListProjectsForManagementQuery,
} from './application/use-cases/query';
import {
  CreateProjectCommand,
  UpdateProjectCommand,
  PublishProjectCommand,
  ArchiveProjectCommand,
  UnarchiveProjectCommand,
  DeleteProjectCommand,
} from './application/use-cases/command';

@Module({
  imports: [
    forwardRef(() => AuthPublicModule),
    ModerationPublicModule,
    TaxonomyPublicModule,
    ProjectRepositoriesModule,
  ],
  providers: [
    ProjectAccessService,
    ListProjectsQuery,
    ListProjectsForManagementQuery,
    ListMyProjectsQuery,
    GetProjectBySlugQuery,
    GetProjectByIdQuery,
    CreateProjectCommand,
    UpdateProjectCommand,
    PublishProjectCommand,
    ArchiveProjectCommand,
    UnarchiveProjectCommand,
    DeleteProjectCommand,
    HandleProjectAccountDeletionRequestedListener,
  ],
  controllers: [ProjectController],
})
export class ProjectModule {}
