import { ApiProperty } from '@nestjs/swagger';

export class GenericPublicAckDTO {
  @ApiProperty()
  acknowledged!: true;
}
