import { Module } from '@nestjs/common';
import { ScheduledJobsController } from '@/app/scheduled-jobs.controller';
import { JobPublicModule } from '@/modules/job/public';
import { AuthPublicModule } from '@/modules/auth/public';
import { NotificationPublicModule } from '@/modules/notification/public';
import { MediaPublicModule } from '@/modules/media/public';
import { AccountPublicModule } from '@/modules/account/public';

@Module({
  imports: [JobPublicModule, AuthPublicModule, NotificationPublicModule, MediaPublicModule, AccountPublicModule],
  controllers: [ScheduledJobsController],
})
export class InternalModule {}
