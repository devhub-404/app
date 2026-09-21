import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EventSuggestionDTO {
  @ApiProperty() id!: string;
  @ApiProperty() url!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) submittedByAccountId!: string | null;
  @ApiProperty({ enum: ['pending', 'accepted', 'rejected'] }) status!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) acceptedEventId!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) decidedByAccountId!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) decisionNote!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) decidedAt!: string | null;
}
