import { ApiProperty } from '@nestjs/swagger';
export class NewsSourceDTO {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() domain!: string;
  @ApiProperty() newsCount!: number;
}
