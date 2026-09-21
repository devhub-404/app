import { Module } from '@nestjs/common';
import { NotificationRepository } from '../application/ports/repositories/notification.repository';
import { DrizzleNotificationRepository } from './repositories/notification.repository';

@Module({
  providers: [{ provide: NotificationRepository, useClass: DrizzleNotificationRepository }],
  exports: [NotificationRepository],
})
export class NotificationRepositoriesModule {}
