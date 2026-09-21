import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';
import { IsUUID } from '@/shared/utils/validators';

export class ListMyVotesQueryDTO {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID({ each: true })
  resourceIds?: string[];
}
