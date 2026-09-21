import { Injectable } from '@nestjs/common';
import {
  NotificationPublicService,
  type CreateNotificationInput,
} from '@/modules/notification/public/notification-public.service';

@Injectable()
export class CreateNotificationCommand {
  constructor(private readonly notifications: NotificationPublicService) {}
  execute(input: CreateNotificationInput) {
    return this.notifications.notify(input);
  }
}
