import { ApiProperty } from '@nestjs/swagger';

export class AccountShellProfileDTO {
  @ApiProperty() username!: string;
  @ApiProperty({ type: String, nullable: true }) displayName!: string | null;
  @ApiProperty({ type: String, nullable: true }) avatarUrl!: string | null;
}

export class AccountShellPreferencesDTO {
  @ApiProperty({ enum: ['pt', 'en', 'es'], nullable: true }) locale!: 'pt' | 'en' | 'es' | null;
}

export class AccountShellAccountDTO {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: ['active', 'deactivated', 'suspended', 'banned'] })
  status!: 'active' | 'deactivated' | 'suspended' | 'banned';
}

export class AccountShellDTO {
  @ApiProperty({ type: AccountShellAccountDTO }) account!: AccountShellAccountDTO;
  @ApiProperty({ type: AccountShellProfileDTO, nullable: true }) profile!: AccountShellProfileDTO | null;
  @ApiProperty({ type: AccountShellPreferencesDTO })
  preferences!: AccountShellPreferencesDTO;
  @ApiProperty({ enum: ['curator', 'admin', 'moderator'], nullable: true }) role!: string | null;
}
