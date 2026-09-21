import { ApiProperty } from '@nestjs/swagger';
import { AuthorDTO } from '@/modules/account/public/author.dto';
import { ContentTagDTO } from '@/modules/taxonomy/public/content-tag.dto';

export class ArticleItemDTO {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: String, nullable: true })
  authorAccountId!: string | null;

  @ApiProperty({ type: () => AuthorDTO, required: false, nullable: true })
  author!: AuthorDTO | null;

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
  readingTimeMinutes!: number;

  @ApiProperty()
  votes!: number;

  @ApiProperty()
  views!: number;

  @ApiProperty()
  commentCount!: number;

  @ApiProperty({ enum: ['draft', 'published', 'archived'] })
  status!: 'draft' | 'published' | 'archived';

  @ApiProperty({ type: String, nullable: true })
  publishedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  hiddenAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  hideReason!: string | null;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ type: String, nullable: true })
  deletedAt!: string | null;
}
