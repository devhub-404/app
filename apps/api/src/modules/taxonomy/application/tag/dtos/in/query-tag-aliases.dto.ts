import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID } from '@/shared/utils/validators';

export class QueryTagAliasesDTO {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  tagId?: string;
}
