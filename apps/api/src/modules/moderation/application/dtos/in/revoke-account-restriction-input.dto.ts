import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class RevokeAccountRestrictionInputDTO {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  reason!: string;
}
