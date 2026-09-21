import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class ListEventsDTO {
  @ApiPropertyOptional({ type: Number, default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ type: Number, default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: ['upcoming', 'ongoing', 'ended'] }) @IsOptional() temporalState?: string;
  @ApiPropertyOptional({ enum: ['online', 'in_person', 'hybrid'] })
  @IsOptional()
  @IsIn(['online', 'in_person', 'hybrid'])
  format?: string;
  @ApiPropertyOptional({ enum: ['upcoming', 'recent'] }) @IsOptional() @IsIn(['upcoming', 'recent']) sort?:
    'upcoming' | 'recent';
}
