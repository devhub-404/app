import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import type { CreateImageUploadInput, MediaUploadPurpose } from '@/modules/media/public/media.service.port';

export class RequestMediaUploadDTO implements Omit<CreateImageUploadInput, 'ownerId'> {
  @ApiProperty({ enum: ['avatar', 'content'] })
  @IsIn(['avatar', 'content'])
  purpose!: MediaUploadPurpose;

  @ApiProperty({ enum: ['image/webp'] })
  @IsString()
  @IsIn(['image/webp'])
  contentType!: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  sizeBytes!: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 3600 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3600)
  expiresInSeconds?: number;
}
