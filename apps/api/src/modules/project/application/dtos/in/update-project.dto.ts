import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';
import { TAG_SLUG } from '../dto.constants';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export class UpdateProjectDTO {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(FIELD_LIMITS.title) title!: string;
  @ApiProperty() @IsString() @MaxLength(FIELD_LIMITS.shortDescription) summary!: string;
  @ApiProperty() @IsString() @MaxLength(FIELD_LIMITS.body) description!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsUrl() projectUrl?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsUrl() repositoryUrl?: string | null;
  @ApiProperty({ type: [String], maxItems: 5 })
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @Matches(TAG_SLUG, { each: true })
  tagSlugs!: string[];
}
