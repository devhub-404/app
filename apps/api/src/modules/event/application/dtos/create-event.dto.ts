import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { EVENT_FORMATS } from './event-enums';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export class CreateEventDTO {
  @ApiProperty() @IsString() @MinLength(4) @MaxLength(FIELD_LIMITS.title) title!: string;
  @ApiProperty() @IsString() @MinLength(20) @MaxLength(FIELD_LIMITS.body) description!: string;
  @ApiProperty({ format: 'uri' })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(FIELD_LIMITS.url)
  url!: string;
  @ApiProperty() @IsDateString() startsAt!: string;
  @ApiProperty() @IsDateString() endsAt!: string;
  @ApiProperty({ enum: EVENT_FORMATS }) @IsIn(EVENT_FORMATS) format!: (typeof EVENT_FORMATS)[number];
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((v: CreateEventDTO) => v.format !== 'online')
  @IsString()
  @MaxLength(FIELD_LIMITS.location)
  location?: string | null;
  @ApiPropertyOptional({ nullable: true, format: 'uuid' }) @IsOptional() @IsUUID() coverMediaId?: string | null;
}
