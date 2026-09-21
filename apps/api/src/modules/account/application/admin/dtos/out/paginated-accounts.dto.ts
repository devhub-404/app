import { AccountListItemDTO } from './account-list-item.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedAccountsDTO {
  @ApiProperty({ type: AccountListItemDTO, isArray: true }) data!: AccountListItemDTO[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() pageSize!: number;
}
