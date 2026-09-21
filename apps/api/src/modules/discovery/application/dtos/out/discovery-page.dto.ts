import { ApiProperty } from '@nestjs/swagger';
import { DiscoveryItemDTO } from './discovery-item.dto';
export class DiscoveryPageDTO {
  @ApiProperty({ type: DiscoveryItemDTO, isArray: true }) items!: DiscoveryItemDTO[];
  @ApiProperty() page!: number;
  @ApiProperty() pageSize!: number;
  @ApiProperty() total!: number;
}
