import { ApiProperty } from '@nestjs/swagger';
import { AuthorDTO } from '@/modules/account/public/author.dto';

export class CommentDTO {
  @ApiProperty() id!: string;
  @ApiProperty() resourceId!: string;
  @ApiProperty({ type: () => AuthorDTO, nullable: true }) author!: AuthorDTO | null;
  @ApiProperty({ type: String, nullable: true }) parentId!: string | null;
  @ApiProperty({ type: String, nullable: true }) content!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty({ type: String, nullable: true }) editedAt!: string | null;
  @ApiProperty({ type: String, nullable: true }) hiddenAt!: string | null;
  @ApiProperty({ type: String, nullable: true }) deletedAt!: string | null;
  @ApiProperty({ type: () => [CommentDTO], required: false }) children?: CommentDTO[];
}
