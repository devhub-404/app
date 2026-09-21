import { ApiProperty } from '@nestjs/swagger';

export class MediaUploadGrantDTO {
  @ApiProperty()
  mediaId!: string;

  @ApiProperty({ format: 'uri' })
  uploadUrl!: string;

  @ApiProperty()
  expiresInSeconds!: number;

  @ApiProperty({ format: 'date-time' })
  expiresAt!: string;
}
