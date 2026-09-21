import { ApiProperty } from '@nestjs/swagger';

export class ConfirmedMediaUploadDTO {
  @ApiProperty()
  mediaId!: string;

  @ApiProperty({ format: 'uri', nullable: true })
  url!: string | null;
}
