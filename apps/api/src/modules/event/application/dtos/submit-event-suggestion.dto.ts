import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class SubmitEventSuggestionDTO {
  @ApiProperty({ format: 'uri' })
  @IsUrl({ protocols: ['https'], require_protocol: true })
  url!: string;
}
