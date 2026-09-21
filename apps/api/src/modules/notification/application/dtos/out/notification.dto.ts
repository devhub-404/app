import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { NotificationReferenceType, NotificationType } from '../../../domain/notification';

export class NotificationDTO {
  @ApiProperty({ type: String }) id!: string;
  @ApiProperty({ type: String }) accountId!: string;
  @ApiProperty({ type: String }) type!: NotificationType;
  @ApiPropertyOptional({ type: String, nullable: true }) targetType!: NotificationReferenceType | null;
  @ApiPropertyOptional({ type: String, nullable: true }) targetId!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) sourceType!: NotificationReferenceType | null;
  @ApiPropertyOptional({ type: String, nullable: true }) sourceId!: string | null;
  @ApiProperty({ type: String, nullable: true }) seenAt!: string | null;
  @ApiProperty({ type: String, nullable: true }) readAt!: string | null;
  @ApiProperty({ type: String }) createdAt!: string;
}
