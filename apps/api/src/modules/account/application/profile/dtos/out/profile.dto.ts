import { ApiProperty } from '@nestjs/swagger';

export class ProfileDTO {
  @ApiProperty({ required: false }) userId?: string;
  @ApiProperty() username!: string;
  @ApiProperty({ type: String, nullable: true }) displayName!: string | null;
  @ApiProperty({ type: String, nullable: true }) avatarUrl!: string | null;
  @ApiProperty({ type: String, nullable: true }) headline!: string | null;
  @ApiProperty({ type: String, nullable: true }) bio!: string | null;
  @ApiProperty({ type: String, nullable: true }) location!: string | null;
  @ApiProperty({ type: String, nullable: true }) portfolioUrl!: string | null;
  @ApiProperty({ type: String, nullable: true }) githubUrl!: string | null;
  @ApiProperty({ type: String, nullable: true }) linkedinUrl!: string | null;
  @ApiProperty({ type: String, nullable: true }) twitterUrl!: string | null;
}
