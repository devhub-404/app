import { ApiProperty } from '@nestjs/swagger';
export class NewsSuggestionDTO {
  @ApiProperty() id!: string;
  @ApiProperty() url!: string;
  @ApiProperty({ nullable: true }) submittedByAccountId!: string | null;
  @ApiProperty() status!: string;
  @ApiProperty({ nullable: true }) newsId!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty({ nullable: true }) resolvedAt!: string | null;
}
