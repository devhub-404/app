import { ApiProperty } from '@nestjs/swagger';

export class TagAliasDTO {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  tagId!: string;

  @ApiProperty()
  alias!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}
