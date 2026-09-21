import { ApiProperty } from '@nestjs/swagger';
import { DISCOVERY_TYPES, type DiscoveryType } from '../../types';

export class DiscoveryItemDTO {
  @ApiProperty({ enum: DISCOVERY_TYPES }) type!: DiscoveryType;
  @ApiProperty() id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() title!: string;
  @ApiProperty() summary!: string;
  @ApiProperty({ nullable: true }) publishedAt!: string | null;
  @ApiProperty({
    description: 'Textual/search score, total vote count on Popular, or weighted recent activity on Trending.',
  })
  relevanceScore!: number;
}
