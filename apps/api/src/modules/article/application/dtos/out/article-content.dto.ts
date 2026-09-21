import { ApiProperty } from '@nestjs/swagger';

export class ArticleContentDTO {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  content!: string;

  @ApiProperty()
  contentVersion!: number;
}
