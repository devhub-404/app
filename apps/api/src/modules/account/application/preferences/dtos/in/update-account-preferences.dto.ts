import { IsIn, ValidateIf } from 'class-validator';
import type { Locale, ProfileVisibility } from '@/modules/account/application/preferences/dtos/out';
import { ApiPropertyOptional } from '@nestjs/swagger';

const LOCALES: Locale[] = ['pt', 'en', 'es'];
const PROFILE_VISIBILITIES: ProfileVisibility[] = ['public', 'private'];

export class UpdateAccountPreferencesDTO {
  @ApiPropertyOptional({ enum: LOCALES, nullable: true })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsIn(LOCALES)
  locale?: Locale | null;

  @ApiPropertyOptional({ enum: PROFILE_VISIBILITIES })
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(PROFILE_VISIBILITIES)
  profileVisibility?: ProfileVisibility;
}
