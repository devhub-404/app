import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export class ApproveExternalResourceSuggestionDTO {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(FIELD_LIMITS.title) title!: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(FIELD_LIMITS.shortDescription) description!: string;
  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  tagSlugs: string[] = [];
}
