import { ApiProperty } from '@nestjs/swagger';
import type { TagIdentityTermKind } from '@/modules/taxonomy/application/tag/ports/tag-identity.repository';

export class TagIdentityTermDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  value!: string;

  @ApiProperty({ enum: ['reserved', 'blocked'] })
  kind!: TagIdentityTermKind;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}
