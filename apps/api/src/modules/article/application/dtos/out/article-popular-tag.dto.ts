import { ApiProperty } from '@nestjs/swagger';

export class ArticlePopularTagDTO {
  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  articleCount!: number;
}
