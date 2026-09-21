import { IsDateString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ArticlePublishInputDTO {
  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }: { value: string }) => value?.trim())
  publishedAt?: string;
}
