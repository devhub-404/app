import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const NEWS_SORT_VALUES = ['recent', 'oldest', 'views'] as const;
export type NewsSort = (typeof NEWS_SORT_VALUES)[number];

export const NEWS_PERIOD_VALUES = ['day', 'week', 'month', 'year', 'all'] as const;
export type NewsPeriod = (typeof NEWS_PERIOD_VALUES)[number];

export class QueryNewsDTO {
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

  @ApiPropertyOptional({ description: 'Domínio normalizado da Source.' })
  @IsOptional()
  @IsString()
  source?: string;

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

  @ApiPropertyOptional({ enum: NEWS_SORT_VALUES })
  @IsOptional()
  @IsString()
  @IsIn(NEWS_SORT_VALUES)
  @Transform(({ value }: { value: string }) => value?.trim()?.toLowerCase())
  sort?: NewsSort;

  @ApiPropertyOptional({ enum: NEWS_PERIOD_VALUES })
  @IsOptional()
  @IsString()
  @IsIn(NEWS_PERIOD_VALUES)
  @Transform(({ value }: { value: string }) => value?.trim()?.toLowerCase())
  period?: NewsPeriod;
}
