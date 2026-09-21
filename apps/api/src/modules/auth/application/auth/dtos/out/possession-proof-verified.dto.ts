import { ApiProperty } from '@nestjs/swagger';

export class PossessionProofVerifiedDTO {
  @ApiProperty()
  accepted!: boolean;
}
