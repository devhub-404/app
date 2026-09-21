import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetNewsCommentsEnabledDTO {
  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;
}
