import { AccountProfileSummaryDTO } from '@/modules/account/public/account-profile-summary.dto';
import { ApiProperty } from '@nestjs/swagger';
import { AnswerDTO } from './answer.dto';

export class QuestionDTO {
  @ApiProperty() id!: string;
  @ApiProperty({ nullable: true }) authorAccountId!: string | null;
  @ApiProperty({ type: AccountProfileSummaryDTO, nullable: true }) author!: AccountProfileSummaryDTO | null;
  @ApiProperty() title!: string;
  @ApiProperty() content!: string;
  @ApiProperty({ type: [String] }) tagSlugs!: string[];
  @ApiProperty({ enum: ['open', 'closed'] }) status!: 'open' | 'closed';
  @ApiProperty({ nullable: true }) acceptedAnswerId!: string | null;
  @ApiProperty({ nullable: true }) hiddenAt!: string | null;
  @ApiProperty({ nullable: true }) deletedAt!: string | null;
  @ApiProperty({ type: AnswerDTO, isArray: true }) answers!: AnswerDTO[];
  @ApiProperty() createdAt!: string;
}
