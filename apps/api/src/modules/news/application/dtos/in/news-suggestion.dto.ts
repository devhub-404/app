import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, MaxLength } from 'class-validator';
export class SubmitNewsSuggestionDTO {
  @ApiProperty() @IsUrl({ protocols: ['http', 'https'] }) @MaxLength(2048) url!: string;
}
