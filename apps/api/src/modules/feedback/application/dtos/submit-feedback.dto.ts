import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export const FEEDBACK_CATEGORIES = ['bug', 'issue', 'suggestion'] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export class SubmitFeedbackDTO {
  @ApiProperty({ enum: FEEDBACK_CATEGORIES })
  @IsIn(FEEDBACK_CATEGORIES)
  category!: FeedbackCategory;

  @ApiProperty({ minLength: 10, maxLength: 4000 })
  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  description!: string;

  @ApiPropertyOptional({ format: 'uri', maxLength: 2048 })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  contextUrl?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsString()
  screenshotMediaId?: string;
}
