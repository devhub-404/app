import { ApiProperty } from '@nestjs/swagger';
import { ContentTagDTO } from '@/modules/taxonomy/public/content-tag.dto';

export class ResourceItemDTO {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  deletedAt?: string | null;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty({ type: () => [ContentTagDTO] })
  tags!: ContentTagDTO[];

  @ApiProperty()
  votes!: number;
}
