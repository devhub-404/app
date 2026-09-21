import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
export class ReviewEventDTO {
  @ApiProperty({ enum: ['published', 'archived'] })
  @IsIn(['published', 'archived'])
  status!: 'published' | 'archived';
}
