import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class ListProjectsDTO {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() authorAccountId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() tags?: string;
  @ApiPropertyOptional({ enum: ['recent', 'title'] }) @IsOptional() @IsIn(['recent', 'title']) sort?:
    'recent' | 'title';
  @ApiPropertyOptional({ type: Number }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ type: Number }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 20;
}
