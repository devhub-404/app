import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNewsDTO {
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsDateString()
  occurredAt?: string | null;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.title)
  @Transform(({ value }: { value: string }) => value?.trim())
  title?: string;

  @ApiPropertyOptional({ maxLength: FIELD_LIMITS.shortDescription })
  @IsOptional()
  @IsString()
  @MaxLength(FIELD_LIMITS.shortDescription)
  @Transform(({ value }: { value: string }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsUUID()
  coverMediaId?: string | null;

  @ApiPropertyOptional({ description: 'Diff Match Patch aplicado somente ao Markdown.' })
  @IsOptional()
  @IsString()
  contentPatch?: string;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  baseContentVersion?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    each: true,
    message: 'tagSlugs must be lower-case hyphenated strings',
  })
  @Transform(({ value }: { value: string[] }) => (Array.isArray(value) ? value.map((tag) => tag.trim()) : value))
  tagSlugs?: string[];
}
