import { ApiProperty } from '@nestjs/swagger';
import { AccountAdminUserDTO } from './account-admin-user.dto';

export class AccountAdminUsersPageDTO {
  @ApiProperty({ type: AccountAdminUserDTO, isArray: true }) data!: AccountAdminUserDTO[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() pageSize!: number;
}
