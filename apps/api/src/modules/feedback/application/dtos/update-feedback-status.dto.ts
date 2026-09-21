import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { FEEDBACK_STATUSES, type FeedbackStatus } from './feedback.dto';

export class UpdateFeedbackStatusDTO {
  @ApiProperty({ enum: FEEDBACK_STATUSES })
  @IsIn(FEEDBACK_STATUSES)
  status!: FeedbackStatus;

  @ApiPropertyOptional({ maxLength: 32, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  internalSeverity?: string | null;
}
