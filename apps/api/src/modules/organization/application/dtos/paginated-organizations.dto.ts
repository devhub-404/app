import { ApiProperty } from '@nestjs/swagger';
import { OrganizationDTO } from './organization.dto';

export class PaginatedOrganizationsDTO {
  @ApiProperty({ type: [OrganizationDTO] }) items!: OrganizationDTO[];
  @ApiProperty() page!: number;
  @ApiProperty() pageSize!: number;
  @ApiProperty() total!: number;
}
