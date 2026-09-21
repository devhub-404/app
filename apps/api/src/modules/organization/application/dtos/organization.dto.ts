import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ORGANIZATION_TYPES, type OrganizationType } from './organization.constants';

export class OrganizationDTO {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ enum: ORGANIZATION_TYPES }) type!: OrganizationType;
  @ApiProperty() description!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) websiteUrl!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) avatarUrl!: string | null;
  @ApiProperty() createdByAccountId!: string;
  @ApiProperty({ enum: ['active', 'archived'] }) status!: 'active' | 'archived';
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}
