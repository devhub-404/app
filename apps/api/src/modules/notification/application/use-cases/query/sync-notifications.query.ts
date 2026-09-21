import { Injectable } from '@nestjs/common';
import type { SyncNotificationsDTO } from '../../dtos/out';
import { ListMyNotificationsQuery } from './list-my-notifications.query';

@Injectable()
export class SyncNotificationsQuery {
  constructor(private readonly listMyNotifications: ListMyNotificationsQuery) {}

  execute(accountId: string, cursor?: string): Promise<SyncNotificationsDTO> {
    return this.listMyNotifications.execute(accountId, cursor);
  }
}
