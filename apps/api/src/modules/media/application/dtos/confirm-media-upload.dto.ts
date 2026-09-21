import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';
import type { ConfirmImageUploadInput, MediaUploadPurpose } from '@/modules/media/public/media.service.port';

export class ConfirmMediaUploadDTO implements Omit<ConfirmImageUploadInput, 'ownerId'> {
  @ApiProperty({ enum: ['avatar', 'content'] })
  @IsIn(['avatar', 'content'])
  purpose!: MediaUploadPurpose;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  mediaId!: string;
}
