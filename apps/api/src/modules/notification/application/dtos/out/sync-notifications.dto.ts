import { ApiProperty } from '@nestjs/swagger';
import { NotificationDTO } from './notification.dto';

export class SyncNotificationsDTO {
  @ApiProperty({ type: [NotificationDTO] }) items!: NotificationDTO[];
  @ApiProperty({ type: String, nullable: true, description: 'Cursor opaco para a próxima sincronização incremental' })
  nextCursor!: string | null;
  @ApiProperty({ type: Number }) unreadCount!: number;
}
