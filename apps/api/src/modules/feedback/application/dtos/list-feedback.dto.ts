import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { FEEDBACK_STATUSES, type FeedbackStatus } from './feedback.dto';

export class ListFeedbackDTO {
  @ApiPropertyOptional({ enum: FEEDBACK_STATUSES })
  @IsOptional()
  @IsIn(FEEDBACK_STATUSES)
  status?: FeedbackStatus;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  pageSize?: number;
}
