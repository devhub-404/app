import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';
import { TAG_SLUG } from '../dto.constants';

export class SaveProjectDTO {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(FIELD_LIMITS.title) title!: string;
  @ApiProperty() @IsString() @MaxLength(FIELD_LIMITS.shortDescription) summary!: string;
  @ApiProperty() @IsString() @MaxLength(FIELD_LIMITS.body) description!: string;
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsUrl()
  @MaxLength(FIELD_LIMITS.url)
  projectUrl?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsUrl()
  @MaxLength(FIELD_LIMITS.url)
  repositoryUrl?: string | null;
  @ApiProperty({ type: [String], maxItems: 5 })
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @Matches(TAG_SLUG, { each: true })
  tagSlugs!: string[];
}
