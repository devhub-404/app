import { ApiProperty } from '@nestjs/swagger';

export class NotificationStatusDTO {
  @ApiProperty() unreadCount!: number;
}
