import { ApiProperty } from '@nestjs/swagger';

export class ReadinessStatusDTO {
  @ApiProperty({ enum: ['ready', 'not_ready'], example: 'ready' })
  status!: 'ready' | 'not_ready';

  @ApiProperty({ example: true })
  ready!: boolean;

  @ApiProperty({ format: 'date-time' })
  timestamp!: string;
}
