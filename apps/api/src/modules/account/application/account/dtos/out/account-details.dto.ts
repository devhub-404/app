import { ApiProperty } from '@nestjs/swagger';
import { AccountEmailDTO } from '@/modules/account/application/account/dtos/out/account-email.dto';
import { AccountSummaryDTO } from '@/modules/account/application/account/dtos/out/account-summary.dto';
import { AccountPreferencesDTO } from '@/modules/account/application/preferences/dtos/out/account-preferences.dto';
import { ProfileDTO } from '@/modules/account/application/profile/dtos/out/profile.dto';

export class AccountDetailsDTO {
  @ApiProperty({ type: AccountSummaryDTO })
  account!: AccountSummaryDTO;

  @ApiProperty({ type: AccountEmailDTO, isArray: true })
  emails!: AccountEmailDTO[];

  @ApiProperty({ type: ProfileDTO, nullable: true })
  profile!: ProfileDTO | null;

  @ApiProperty({ type: AccountPreferencesDTO, nullable: true })
  preferences!: AccountPreferencesDTO | null;

  @ApiProperty({ enum: ['curator', 'admin', 'moderator'], nullable: true })
  role!: 'curator' | 'admin' | 'moderator' | null;
}
