import { ApiProperty } from '@nestjs/swagger';

export class GenericAuthenticatedAckDTO {
  @ApiProperty()
  acknowledged!: true;
}
