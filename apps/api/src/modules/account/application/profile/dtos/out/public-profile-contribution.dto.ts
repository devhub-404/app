import { ApiProperty } from '@nestjs/swagger';

export const PUBLIC_PROFILE_CONTRIBUTION_TYPES = [
  'article',
  'project',
  'question',
  'answer',
  'resource',
  'job',
] as const;
export type PublicProfileContributionType = (typeof PUBLIC_PROFILE_CONTRIBUTION_TYPES)[number];

export class PublicProfileContributionDTO {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: PUBLIC_PROFILE_CONTRIBUTION_TYPES }) type!: PublicProfileContributionType;
  @ApiProperty() title!: string;
  @ApiProperty({ type: String, nullable: true }) slug!: string | null;
  @ApiProperty({ type: String, nullable: true }) parentId!: string | null;
  @ApiProperty({ type: String, nullable: true }) occurredAt!: string | null;
  @ApiProperty({ type: Number, nullable: true }) contributionCount!: number | null;
}
