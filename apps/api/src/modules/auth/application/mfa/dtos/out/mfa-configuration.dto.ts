import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class MfaConfigurationDTO {
  @IsBoolean()
  @ApiProperty()
  enabled!: boolean;

  @IsBoolean()
  @ApiProperty()
  totpEnrolled!: boolean;

  @IsOptional()
  @IsIn(['pending', 'active', 'disabled'])
  @ApiProperty({ enum: ['pending', 'active', 'disabled'], nullable: true })
  totpStatus!: 'pending' | 'active' | 'disabled' | null;

  @IsInt()
  @Min(0)
  @ApiProperty()
  recoveryCodesRemaining!: number;
}
