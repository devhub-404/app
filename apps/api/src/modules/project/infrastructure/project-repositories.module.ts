import { AccountProfileReadModule } from '@/modules/account/public/account-profile-read.module';
import { Module } from '@nestjs/common';
import { ProjectRepository } from '../application/ports/repositories/project.repository';
import { ProjectQueryRepository } from '../application/ports/repositories/project.query.repository';
import { DrizzleProjectRepository } from './repositories/project.repository';

@Module({
  imports: [AccountProfileReadModule],
  providers: [
    { provide: ProjectRepository, useClass: DrizzleProjectRepository },
    { provide: ProjectQueryRepository, useExisting: ProjectRepository },
  ],
  exports: [ProjectRepository, ProjectQueryRepository],
})
export class ProjectRepositoriesModule {}
