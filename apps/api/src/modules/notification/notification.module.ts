import { forwardRef, Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { NotificationRepositoriesModule } from './infrastructure/notification-repositories.module';
import { NotificationPublicService } from './public/notification-public.service';
import { NotificationController } from './presentation/notification.controller';
import {
  GetNotificationStatusQuery,
  ListMyNotificationsQuery,
  SyncNotificationsQuery,
} from './application/use-cases/query';
import {
  MarkAllNotificationsReadCommand,
  MarkNotificationReadCommand,
  PurgeOldNotificationsCommand,
  CreateNotificationCommand,
} from './application/use-cases/command';
import { HandleNotificationAccountPurgeRequestedListener } from './application/handle-account-purge-requested.listener';
import { NotificationPolicyRegistry } from './application/policies/notification-policy.registry';

@Module({
  imports: [NotificationRepositoriesModule, forwardRef(() => AuthPublicModule)],
  providers: [
    ListMyNotificationsQuery,
    SyncNotificationsQuery,
    GetNotificationStatusQuery,
    MarkNotificationReadCommand,
    MarkAllNotificationsReadCommand,
    PurgeOldNotificationsCommand,
    HandleNotificationAccountPurgeRequestedListener,
    NotificationPublicService,
    CreateNotificationCommand,
    NotificationPolicyRegistry,
  ],
  controllers: [NotificationController],
  exports: [NotificationPublicService, NotificationPolicyRegistry, PurgeOldNotificationsCommand],
})
export class NotificationModule {}
