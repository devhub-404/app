import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { ORGANIZATION_TYPES, type OrganizationType } from './organization.constants';

export class CreateOrganizationDTO {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(160) name!: string;
  @ApiProperty({ enum: ORGANIZATION_TYPES }) @IsIn(ORGANIZATION_TYPES) type!: OrganizationType;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(10000) description!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsUrl() websiteUrl?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) @IsOptional() @IsUrl() avatarUrl?: string | null;
}
