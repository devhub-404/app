import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetArticleCommentsEnabledDTO {
  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;
}
