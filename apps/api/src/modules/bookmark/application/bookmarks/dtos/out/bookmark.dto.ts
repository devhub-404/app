import { ApiProperty } from '@nestjs/swagger';

export class BookmarkDTO {
  @ApiProperty() accountId!: string;
  @ApiProperty() resourceId!: string;
  @ApiProperty() active!: boolean;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}
