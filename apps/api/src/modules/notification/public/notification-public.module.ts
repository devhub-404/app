import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification.module';

@Module({
  imports: [NotificationModule],
  exports: [NotificationModule],
})
export class NotificationPublicModule {}
