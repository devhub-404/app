import { ApiProperty } from '@nestjs/swagger';

export class HealthStatusDTO {
  @ApiProperty({ example: 'ok' })
  status!: 'ok';

  @ApiProperty({ format: 'date-time' })
  timestamp!: string;
}
