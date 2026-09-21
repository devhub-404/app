import { ApiProperty } from '@nestjs/swagger';

export class ContentTagDTO {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}
