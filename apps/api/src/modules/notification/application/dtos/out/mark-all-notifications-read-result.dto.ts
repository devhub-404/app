import { ApiProperty } from '@nestjs/swagger';

export class MarkAllNotificationsReadResultDTO {
  @ApiProperty()
  updated!: number;
}
