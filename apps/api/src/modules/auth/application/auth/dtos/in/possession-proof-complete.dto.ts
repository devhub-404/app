import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class PossessionProofCompleteDTO {
  @IsOptional()
  @IsString()
  @Length(1, 512)
  @ApiProperty({ required: false })
  emailCode?: string;

  @IsOptional()
  @IsIn(['totp', 'recovery_code'])
  @ApiProperty({ enum: ['totp', 'recovery_code'], required: false })
  mfaMethod?: 'totp' | 'recovery_code';

  @IsOptional()
  @IsString()
  @Length(1, 32)
  @ApiProperty({ required: false })
  mfaCode?: string;
}
