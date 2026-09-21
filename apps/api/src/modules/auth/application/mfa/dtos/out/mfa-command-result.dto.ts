import { ApiHideProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class VerifyTotpResultDTO {
  @ApiHideProperty()
  @IsString()
  sessionSecret!: string;
}

export class VerifyRecoveryCodeResultDTO {
  @ApiHideProperty()
  @IsString()
  sessionSecret!: string;

  @ApiHideProperty()
  recoveryCodeUsed!: true;

  @ApiHideProperty()
  @IsInt()
  remainingCodes!: number;
}
