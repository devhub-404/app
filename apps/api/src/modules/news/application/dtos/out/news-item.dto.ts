import { ApiProperty } from '@nestjs/swagger';
import { ContentTagDTO } from '@/modules/taxonomy/public/content-tag.dto';

export class NewsItemDTO {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  coverImageUrl?: string | null;

  @ApiProperty({ type: () => [ContentTagDTO] })
  tags!: ContentTagDTO[];

  @ApiProperty()
  views!: number;

  @ApiProperty({ type: String, nullable: true })
  occurredAt!: string | null;

  @ApiProperty({ enum: ['draft', 'published', 'archived'] })
  status!: 'draft' | 'published' | 'archived';

  @ApiProperty({ type: String, nullable: true })
  publishedAt!: string | null;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ type: String, nullable: true })
  deletedAt!: string | null;
}
