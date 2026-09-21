import { ApiProperty } from '@nestjs/swagger';

export class ViewResultDTO {
  @ApiProperty() resourceId!: string;
  @ApiProperty() views!: number;
}
