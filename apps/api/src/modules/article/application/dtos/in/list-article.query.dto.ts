import { IsArray, IsNumberString, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class ListArticleQueryDTO {
  @ApiPropertyOptional({ maxLength: 120 })
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsString()
  @MaxLength(120)
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ type: [String], maxItems: 5 })
  @IsArray()
  @IsString({ each: true })
  @MaxLength(32, { each: true })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    each: true,
    message: 'tags must be slugs',
  })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ minimum: 1 })
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsNumberString()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ minimum: 1 })
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsNumberString()
  @IsOptional()
  pageSize?: string;
}
