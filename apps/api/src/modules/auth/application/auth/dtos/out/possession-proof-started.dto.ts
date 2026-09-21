import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class PossessionProofStartedDTO {
  @IsBoolean()
  @ApiProperty()
  sent!: boolean;

  @IsOptional()
  @ApiProperty({ required: false, enum: [true] })
  mfaRequired?: true;
}
