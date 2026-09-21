import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export class CreateResourceReportDTO {
  @ApiProperty({ maxLength: FIELD_LIMITS.reportReason })
  @IsString()
  @MaxLength(FIELD_LIMITS.reportReason)
  reason!: string;

  @ApiPropertyOptional({ maxLength: FIELD_LIMITS.reviewNote })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.reviewNote)
  description?: string;
}
