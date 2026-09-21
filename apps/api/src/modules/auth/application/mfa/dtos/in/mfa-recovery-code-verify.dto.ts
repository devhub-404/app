import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MfaRecoveryCodeVerifyDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  recoveryCode!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  deviceName?: string;
}
