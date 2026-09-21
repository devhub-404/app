import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DISCOVERY_TYPES, type DiscoveryType } from '@/modules/discovery/application/types';

export class RelatedContentQueryDTO {
  @ApiProperty({ enum: DISCOVERY_TYPES }) @IsIn(DISCOVERY_TYPES) type!: DiscoveryType;
  @ApiProperty() @IsString() id!: string;
  @ApiPropertyOptional({ minimum: 1, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number;
}
