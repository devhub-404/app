import { AccountProfileSummaryDTO } from '@/modules/account/public/account-profile-summary.dto';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerDTO {
  @ApiProperty() id!: string;
  @ApiProperty() questionId!: string;
  @ApiProperty({ nullable: true }) authorAccountId!: string | null;
  @ApiProperty({ type: AccountProfileSummaryDTO, nullable: true }) author!: AccountProfileSummaryDTO | null;
  @ApiProperty() content!: string;
  @ApiProperty({ nullable: true }) acceptedAt!: string | null;
  @ApiProperty({ nullable: true }) hiddenAt!: string | null;
  @ApiProperty({ nullable: true }) deletedAt!: string | null;
  @ApiProperty() votes!: number;
  @ApiProperty() createdAt!: string;
}
