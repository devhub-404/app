import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const RESOURCE_SORT_VALUES = ['votes'] as const;
export type ResourceSort = (typeof RESOURCE_SORT_VALUES)[number];

export class QueryResourceDTO {
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

  @ApiProperty({ default: 1 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value === undefined ? 1 : Number(value)))
  page!: number;

  @ApiProperty({ default: 20 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value === undefined ? 20 : Number(value)))
  pageSize!: number;

  @ApiPropertyOptional({ enum: RESOURCE_SORT_VALUES })
  @IsOptional()
  @IsString()
  @IsIn(RESOURCE_SORT_VALUES)
  @Transform(({ value }: { value: string }) => value?.trim()?.toLowerCase())
  sort?: ResourceSort;
}
