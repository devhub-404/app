import { ApiProperty } from '@nestjs/swagger';
import { BookmarkDTO } from './bookmark.dto';

export class SyncMyBookmarksDTO {
  @ApiProperty({ type: () => BookmarkDTO, isArray: true }) items!: BookmarkDTO[];
  @ApiProperty() syncedThrough!: string;
}
