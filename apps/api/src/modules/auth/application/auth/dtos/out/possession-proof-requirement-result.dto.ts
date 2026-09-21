import { ApiProperty } from '@nestjs/swagger';

export class PossessionProofRequirementResultDTO {
  @ApiProperty()
  accepted!: boolean;

  @ApiProperty()
  required!: boolean;
}
