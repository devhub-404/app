import { ApiProperty } from '@nestjs/swagger';
import { EventSuggestionDTO } from './event-suggestion.dto';

export class PaginatedEventSuggestionsDTO {
  @ApiProperty({ type: [EventSuggestionDTO] }) items!: EventSuggestionDTO[];
  @ApiProperty() page!: number;
  @ApiProperty() pageSize!: number;
  @ApiProperty() total!: number;
}
