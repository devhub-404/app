import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { TAG_SLUG } from '../dto.constants';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export class CreateQuestionDTO {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(FIELD_LIMITS.title)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(16)
  @MaxLength(FIELD_LIMITS.body)
  content!: string;

  @ApiProperty({ type: [String], maxItems: 5 })
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @Matches(TAG_SLUG, { each: true })
  tagSlugs!: string[];
}
