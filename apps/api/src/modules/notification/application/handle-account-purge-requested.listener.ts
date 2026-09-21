import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ACCOUNT_PURGE_REQUESTED_EVENT, type AccountPurgeRequestedEvent } from '@/modules/account/public/events';
import { NotificationRepository } from './ports/repositories/notification.repository';

@Injectable()
export class HandleNotificationAccountPurgeRequestedListener {
  constructor(private readonly repository: NotificationRepository) {}

  @OnEvent(ACCOUNT_PURGE_REQUESTED_EVENT)
  async handle(event: AccountPurgeRequestedEvent): Promise<void> {
    await this.repository.deleteByAccountId(event.userId);
  }
}
