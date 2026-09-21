import type { OrganizationPublicSummary } from '@/modules/organization/public/organization-public.service';
import { ApiProperty } from '@nestjs/swagger';
import { COMP_UNITS, JOB_TYPES, WORKPLACE_TYPES } from '../dto.constants';

export class JobDTO {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: ['organization', 'community'] }) publicationType!: 'organization' | 'community';
  @ApiProperty({ type: String, nullable: true }) publisherOrganizationId!: string | null;
  @ApiProperty({ type: Object, nullable: true }) publisher!: OrganizationPublicSummary | null;
  @ApiProperty() title!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ enum: JOB_TYPES }) employmentType!: (typeof JOB_TYPES)[number];
  @ApiProperty({ enum: WORKPLACE_TYPES }) workplaceType!: (typeof WORKPLACE_TYPES)[number];
  @ApiProperty({ type: String, nullable: true }) location!: string | null;
  @ApiProperty({ type: String, nullable: true }) compensationMin!: string | null;
  @ApiProperty({ type: String, nullable: true }) compensationMax!: string | null;
  @ApiProperty({ type: String, nullable: true }) compensationCurrency!: string | null;
  @ApiProperty({ enum: COMP_UNITS, nullable: true }) compensationUnit!: (typeof COMP_UNITS)[number] | null;
  @ApiProperty() applicationUrl!: string;
  @ApiProperty({ type: String, nullable: true }) sourceUrl!: string | null;
  @ApiProperty({ type: [String] }) tagSlugs!: string[];
  @ApiProperty({ enum: ['published', 'closed', 'expired', 'withdrawn'] }) status!:
    'published' | 'closed' | 'expired' | 'withdrawn';
  @ApiProperty() publishedAt!: string;
  @ApiProperty() expiresAt!: string;
  @ApiProperty({ type: String, nullable: true }) closedAt!: string | null;
  @ApiProperty({ type: String, nullable: true }) withdrawnAt!: string | null;
  @ApiProperty({ type: String, nullable: true }) hiddenAt!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}
