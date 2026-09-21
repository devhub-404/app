import { ApiProperty } from '@nestjs/swagger';

export type Locale = 'pt' | 'en' | 'es';
export type ProfileVisibility = 'public' | 'private';

export class AccountPreferencesDTO {
  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: ['pt', 'en', 'es'], nullable: true })
  locale!: Locale | null;

  @ApiProperty({ enum: ['public', 'private'] })
  profileVisibility!: ProfileVisibility;
}
