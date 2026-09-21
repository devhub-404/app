import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ReportCreatedDTO {
  @ApiProperty()
  @IsString()
  id!: string;
}
