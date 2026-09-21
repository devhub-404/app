import { Controller, Get, Param, Patch, Post, Query, UseGuards, Version } from '@nestjs/common';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { User } from '@/modules/auth/public/http';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import {
  MarkAllNotificationsReadResultDTO,
  NotificationDTO,
  SyncNotificationsDTO,
  SyncNotificationsQueryDTO,
} from '../application/dtos';
import { SyncNotificationsQuery } from '../application/use-cases/query';
import { MarkAllNotificationsReadCommand, MarkNotificationReadCommand } from '../application/use-cases/command';

@Controller('me/notifications')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(
    private readonly syncNotifications: SyncNotificationsQuery,
    private readonly markNotificationRead: MarkNotificationReadCommand,
    private readonly markAllNotificationsRead: MarkAllNotificationsReadCommand,
  ) {}

  @Version('1')
  @Get()
  @AppResponse('NOTIFICATIONS_SYNCED', SyncNotificationsDTO)
  sync(@User('id') accountId: string, @Query() query: SyncNotificationsQueryDTO) {
    return this.syncNotifications.execute(accountId, query.cursor);
  }

  @Version('1')
  @Patch(':id/read')
  @AppResponse('NOTIFICATION_MARKED_READ', NotificationDTO)
  markRead(@User('id') accountId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.markNotificationRead.execute(accountId, id);
  }

  @Version('1')
  @Post('read-all')
  @AppResponse('NOTIFICATIONS_MARKED_READ', MarkAllNotificationsReadResultDTO)
  markAllRead(@User('id') accountId: string) {
    return this.markAllNotificationsRead.execute(accountId);
  }
}
