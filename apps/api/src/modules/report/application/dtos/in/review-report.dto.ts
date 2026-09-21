import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export class ReviewReportDTO {
  @ApiProperty({ enum: ['resolved', 'dismissed'] })
  @IsIn(['resolved', 'dismissed'])
  decision!: 'resolved' | 'dismissed';

  @ApiPropertyOptional({ maxLength: FIELD_LIMITS.reviewNote })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.reviewNote)
  note?: string;
}
