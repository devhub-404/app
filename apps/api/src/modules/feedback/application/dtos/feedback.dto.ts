import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FEEDBACK_CATEGORIES, type FeedbackCategory } from './submit-feedback.dto';

export const FEEDBACK_STATUSES = ['open', 'in_review', 'resolved', 'dismissed'] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export class FeedbackDTO {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid', nullable: true }) reporterAccountId!: string | null;
  @ApiProperty({ enum: FEEDBACK_CATEGORIES }) category!: FeedbackCategory;
  @ApiProperty() description!: string;
  @ApiPropertyOptional({ format: 'uri', nullable: true }) contextUrl!: string | null;
  @ApiPropertyOptional({ format: 'uuid', nullable: true }) screenshotMediaId!: string | null;
  @ApiProperty({ enum: FEEDBACK_STATUSES }) status!: FeedbackStatus;
  @ApiPropertyOptional({ nullable: true }) internalSeverity!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiPropertyOptional({ nullable: true }) resolvedAt!: string | null;
}
