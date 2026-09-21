import { AccountProfileSummaryDTO } from '@/modules/account/public/account-profile-summary.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectDTO {
  @ApiProperty() id!: string;
  @ApiProperty() authorAccountId!: string;
  @ApiProperty({ type: AccountProfileSummaryDTO, nullable: true }) author!: AccountProfileSummaryDTO | null;
  @ApiProperty() title!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() summary!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ type: [String] }) tagSlugs!: string[];
  @ApiProperty({ type: String, nullable: true }) projectUrl!: string | null;
  @ApiProperty({ type: String, nullable: true }) repositoryUrl!: string | null;
  @ApiProperty({ enum: ['draft', 'published', 'archived'] }) status!: 'draft' | 'published' | 'archived';
  @ApiProperty({ type: String, nullable: true }) publishedAt!: string | null;
  @ApiProperty({ type: String, nullable: true }) hiddenAt!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}
