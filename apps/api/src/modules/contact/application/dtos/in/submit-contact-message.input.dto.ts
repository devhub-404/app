import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CONTACT_MESSAGE_TYPES, type ContactMessageType } from '@/modules/contact/domain';

export { CONTACT_MESSAGE_TYPES };
export type { ContactMessageType };

export class SubmitContactMessageInputDTO {
  @ApiProperty({ enum: CONTACT_MESSAGE_TYPES })
  @IsIn(CONTACT_MESSAGE_TYPES)
  type!: ContactMessageType;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }: { value: string | undefined }) => value?.trim() || undefined)
  name?: string;

  @ApiProperty({ format: 'email' })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  email!: string;

  @ApiProperty({ minLength: 3, maxLength: 160 })
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  @Transform(({ value }: { value: string }) => value?.trim())
  subject!: string;

  @ApiProperty({ minLength: 10, maxLength: 4000 })
  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  @Transform(({ value }: { value: string }) => value?.trim())
  message!: string;

  @ApiPropertyOptional({ format: 'uri' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  contextUrl?: string;
}
