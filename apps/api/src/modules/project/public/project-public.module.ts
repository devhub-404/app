import { Module } from '@nestjs/common';
import { ProjectRepositoriesModule } from '../infrastructure/project-repositories.module';
import { ProjectPublicService, ProjectPublicServicePort } from './project-public.service';

@Module({
  imports: [ProjectRepositoriesModule],
  providers: [{ provide: ProjectPublicServicePort, useClass: ProjectPublicService }],
  exports: [ProjectPublicServicePort],
})
export class ProjectPublicModule {}
