import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListQuestionsDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['open', 'closed', 'solved'] })
  @IsOptional()
  @IsIn(['open', 'closed', 'solved'])
  status?: 'open' | 'closed' | 'solved';

  @ApiPropertyOptional() @IsOptional() @IsString() tags?: string;
  @ApiPropertyOptional({ enum: ['recent', 'answers'] }) @IsOptional() @IsIn(['recent', 'answers']) sort?:
    'recent' | 'answers';

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;
}
