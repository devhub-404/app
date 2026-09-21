import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { JOB_TYPES, WORKPLACE_TYPES } from '../dto.constants';

export class ListJobsDTO {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() publisherOrganizationId?: string;
  @ApiPropertyOptional({ enum: JOB_TYPES }) @IsOptional() @IsIn(JOB_TYPES) employmentType?: (typeof JOB_TYPES)[number];
  @ApiPropertyOptional({ enum: WORKPLACE_TYPES })
  @IsOptional()
  @IsIn(WORKPLACE_TYPES)
  workplaceType?: (typeof WORKPLACE_TYPES)[number];
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional({ type: Number }) @IsOptional() @Type(() => Number) @Min(0) minComp?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() tags?: string;
  @ApiPropertyOptional({ enum: ['recent', 'comp'] }) @IsOptional() @IsIn(['recent', 'comp']) sort?: 'recent' | 'comp';
  @ApiPropertyOptional({ type: Number }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ type: Number }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 20;
}
