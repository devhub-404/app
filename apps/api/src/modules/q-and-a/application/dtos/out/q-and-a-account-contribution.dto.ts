import { ApiProperty } from '@nestjs/swagger';

export class QAndAAccountContributionDTO {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: ['question', 'answer'] }) type!: 'question' | 'answer';
  @ApiProperty() title!: string;
  @ApiProperty({ nullable: true }) parentId!: string | null;
  @ApiProperty() occurredAt!: string;
  @ApiProperty({ nullable: true }) hiddenAt!: string | null;
}
