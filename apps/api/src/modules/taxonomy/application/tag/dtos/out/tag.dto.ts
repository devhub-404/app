import { ApiProperty } from '@nestjs/swagger';
import type { TagStatus } from '@/modules/taxonomy/domain/tag';

export class TagDTO {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ enum: ['active', 'archived'] })
  status!: TagStatus;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
