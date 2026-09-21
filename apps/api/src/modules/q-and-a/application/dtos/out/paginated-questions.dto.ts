import { ApiProperty } from '@nestjs/swagger';
import { QuestionItemDTO } from './question-item.dto';

export class PaginatedQuestionsDTO {
  @ApiProperty({ type: QuestionItemDTO, isArray: true })
  items!: QuestionItemDTO[];

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  total!: number;
}
