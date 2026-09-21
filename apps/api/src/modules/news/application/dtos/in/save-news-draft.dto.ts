import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Matches,
} from 'class-validator';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveNewsDraftInputDTO {
  @ApiPropertyOptional({ type: [String], maxItems: 20 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUrl({ protocols: ['http', 'https'] }, { each: true })
  sourceUrls?: string[];
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsDateString()
  occurredAt?: string | null;
  @ApiProperty()
  @IsString()
  @MaxLength(FIELD_LIMITS.title)
  @Transform(({ value }: { value: string }) => value?.trim())
  title!: string;

  @ApiProperty({ maxLength: FIELD_LIMITS.shortDescription })
  @IsString()
  @MaxLength(FIELD_LIMITS.shortDescription)
  @Transform(({ value }: { value: string }) => value?.trim())
  description!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsUUID()
  coverMediaId?: string | null;

  @ApiProperty({ maxLength: FIELD_LIMITS.body })
  @IsString()
  @MaxLength(FIELD_LIMITS.body)
  @Transform(({ value }: { value: string }) => value?.trim())
  content!: string;

  @ApiProperty({ type: [String], minItems: 0, maxItems: 5 })
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    each: true,
    message: 'tagSlugs must be lower-case hyphenated strings',
  })
  @Transform(({ value }: { value: string[] }) => (Array.isArray(value) ? value.map((tag) => tag.trim()) : value))
  tagSlugs!: string[];
}
