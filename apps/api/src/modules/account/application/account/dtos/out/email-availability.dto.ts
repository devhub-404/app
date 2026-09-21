import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class EmailAvailabilityDTO {
  @IsBoolean()
  @ApiProperty()
  available!: boolean;
}
