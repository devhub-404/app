import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class SyncBookmarksQueryDTO {
  @ApiPropertyOptional() @IsOptional() @IsISO8601() updatedAfter?: string;
}
