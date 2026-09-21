import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const ARTICLE_SORT_VALUES = ['votes', 'views', 'comments'] as const;
export type ArticleSort = (typeof ARTICLE_SORT_VALUES)[number];

export const ARTICLE_PERIOD_VALUES = ['day', 'week', 'month', 'year', 'all'] as const;
export type ArticlePeriod = (typeof ARTICLE_PERIOD_VALUES)[number];

export class QueryArticleDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  tags?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  page?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  pageSize?: number;

  @ApiPropertyOptional({ enum: ARTICLE_SORT_VALUES })
  @IsOptional()
  @IsString()
  @IsIn(ARTICLE_SORT_VALUES)
  @Transform(({ value }: { value: string }) => value?.trim()?.toLowerCase())
  sort?: ArticleSort;

  @ApiPropertyOptional({ enum: ARTICLE_PERIOD_VALUES })
  @IsOptional()
  @IsString()
  @IsIn(ARTICLE_PERIOD_VALUES)
  @Transform(({ value }: { value: string }) => value?.trim()?.toLowerCase())
  period?: ArticlePeriod;
}
