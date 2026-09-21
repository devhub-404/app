import { ApiProperty } from '@nestjs/swagger';

import { AccountRestrictionDTO } from './account-restriction.dto';

export class AccountStandingDTO {
  @ApiProperty() accountId!: string;
  @ApiProperty({ enum: ['clear', 'restricted'] }) standing!: 'clear' | 'restricted';
  @ApiProperty({ type: AccountRestrictionDTO, isArray: true }) restrictions!: AccountRestrictionDTO[];
}
