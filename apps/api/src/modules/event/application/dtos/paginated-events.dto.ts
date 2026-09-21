import { ApiProperty } from '@nestjs/swagger';
import { EventDTO } from './event.dto';
export class PaginatedEventsDTO {
  @ApiProperty({ type: [EventDTO] }) items!: EventDTO[];
  @ApiProperty() page!: number;
  @ApiProperty() pageSize!: number;
  @ApiProperty() total!: number;
}
