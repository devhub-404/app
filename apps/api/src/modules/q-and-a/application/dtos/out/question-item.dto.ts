import { AccountProfileSummaryDTO } from '@/modules/account/public/account-profile-summary.dto';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionItemDTO {
  @ApiProperty() id!: string;
  @ApiProperty({ nullable: true }) authorAccountId!: string | null;
  @ApiProperty({ type: AccountProfileSummaryDTO, nullable: true }) author!: AccountProfileSummaryDTO | null;
  @ApiProperty() title!: string;
  @ApiProperty({ type: [String] }) tagSlugs!: string[];
  @ApiProperty({ enum: ['open', 'closed'] }) status!: 'open' | 'closed';
  @ApiProperty({ nullable: true }) acceptedAnswerId!: string | null;
  @ApiProperty() answerCount!: number;
  @ApiProperty() createdAt!: string;
}
