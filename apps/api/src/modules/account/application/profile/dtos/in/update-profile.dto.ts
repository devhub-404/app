import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import {
  BIO_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  HEADLINE_MAX_LENGTH,
  LOCATION_MAX_LENGTH,
  PORTFOLIO_URL_MAX_LENGTH,
  SOCIAL_LINK_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
} from '@/modules/account/domain/entities/profile';

export class UpdateProfileDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(USERNAME_MAX_LENGTH)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  username?: string;
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(DISPLAY_NAME_MAX_LENGTH)
  displayName?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(HEADLINE_MAX_LENGTH)
  headline?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsString() @MaxLength(BIO_MAX_LENGTH) bio?:
    string | null;
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(LOCATION_MAX_LENGTH)
  location?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsString() avatarMediaId?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsUrl()
  @MaxLength(PORTFOLIO_URL_MAX_LENGTH)
  portfolioUrl?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsUrl()
  @MaxLength(SOCIAL_LINK_MAX_LENGTH)
  githubUrl?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsUrl()
  @MaxLength(SOCIAL_LINK_MAX_LENGTH)
  linkedinUrl?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsUrl()
  @MaxLength(SOCIAL_LINK_MAX_LENGTH)
  twitterUrl?: string | null;
}
