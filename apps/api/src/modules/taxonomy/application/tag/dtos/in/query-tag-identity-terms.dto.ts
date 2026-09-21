import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { TagIdentityTermKind } from '@/modules/taxonomy/application/tag/ports/tag-identity.repository';

export class QueryTagIdentityTermsDTO {
  @ApiPropertyOptional({ enum: ['reserved', 'blocked'] })
  @IsOptional()
  @IsIn(['reserved', 'blocked'])
  kind?: TagIdentityTermKind;
}
