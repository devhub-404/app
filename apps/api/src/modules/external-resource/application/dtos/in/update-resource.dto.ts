import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, IsString, IsUrl, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateResourceDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @Transform(({ value }: { value: string }) => value?.trim())
  url?: string;

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
