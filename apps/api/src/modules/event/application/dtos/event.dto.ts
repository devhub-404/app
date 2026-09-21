import { ApiProperty } from '@nestjs/swagger';
import { EVENT_FORMATS, EVENT_STATUSES } from './event-enums';

export class EventDTO {
  @ApiProperty() id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ enum: EVENT_STATUSES }) status!: string;
  @ApiProperty() title!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ type: String, nullable: true }) coverMediaId!: string | null;
  @ApiProperty() url!: string;
  @ApiProperty() startsAt!: string;
  @ApiProperty() endsAt!: string;
  @ApiProperty({ enum: EVENT_FORMATS }) format!: string;
  @ApiProperty({ type: String, nullable: true }) location!: string | null;
  @ApiProperty({ type: String, nullable: true }) publishedAt!: string | null;
  @ApiProperty({ type: String, nullable: true }) deletedAt!: string | null;
  @ApiProperty({ type: String, nullable: true }) temporalState!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}
