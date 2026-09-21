import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  RESTRICTION_CAPABILITIES,
  type RestrictionCapability,
} from '@/modules/moderation/public/account-restriction.port';

export class RestrictAccountCapabilityInputDTO {
  @ApiProperty({ enum: RESTRICTION_CAPABILITIES })
  @IsIn(RESTRICTION_CAPABILITIES)
  capability!: RestrictionCapability;

  @ApiProperty({ maxLength: 500 })
  @IsString()
  @MaxLength(500)
  reason!: string;

  @ApiProperty()
  @IsDateString()
  startsAt!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  endsAt?: string | null;
}
