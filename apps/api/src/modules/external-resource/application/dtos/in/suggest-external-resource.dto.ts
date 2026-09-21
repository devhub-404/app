import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, MaxLength } from 'class-validator';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export class SuggestExternalResourceDTO {
  @ApiProperty({ maxLength: FIELD_LIMITS.url }) @IsUrl() @MaxLength(FIELD_LIMITS.url) url!: string;
}
