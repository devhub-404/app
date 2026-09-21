import { forwardRef, Module } from '@nestjs/common';
import { NotificationPublicModule } from '@/modules/notification/public/notification-public.module';
import { JobRepositoriesModule } from '../infrastructure/job-repositories.module';
import { JobPublicService, JobPublicServicePort } from './job-public.service';

@Module({
  imports: [forwardRef(() => NotificationPublicModule), forwardRef(() => JobRepositoriesModule)],
  providers: [{ provide: JobPublicServicePort, useClass: JobPublicService }],
  exports: [JobPublicServicePort],
})
export class JobPublicModule {}
