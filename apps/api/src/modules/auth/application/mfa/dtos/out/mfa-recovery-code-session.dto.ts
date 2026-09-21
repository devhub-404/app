import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
export class MfaRecoveryCodeSessionDTO {
  @ApiProperty()
  recoveryCodeUsed!: true;

  @IsInt()
  @ApiProperty()
  remainingCodes!: number;
}
