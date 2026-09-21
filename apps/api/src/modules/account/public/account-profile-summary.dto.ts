import { ApiProperty } from '@nestjs/swagger';

export class AccountProfileSummaryDTO {
  @ApiProperty() username!: string;
  @ApiProperty() displayName!: string;
  @ApiProperty({ type: String, nullable: true }) avatarUrl!: string | null;
}
