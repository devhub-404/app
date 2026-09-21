import { Module } from '@nestjs/common';
import { S3ObjectStorageAssetService } from '@/modules/media/infrastructure/storage/s3-object-storage-asset.service';
import { LazyS3Client } from '@/modules/media/infrastructure/storage/lazy-s3-client.service';
import { ObjectStorageAssetService } from '@/modules/media/application/ports/object-storage-asset.service';
import { ObjectStoragePresignerService } from '@/modules/media/application/ports/object-storage-presigner.service';
import { S3ObjectStoragePresignerService } from '@/modules/media/infrastructure/storage/s3-object-storage-presigner.service';

@Module({
  exports: [ObjectStorageAssetService, ObjectStoragePresignerService],
  providers: [
    LazyS3Client,
    {
      provide: ObjectStorageAssetService,
      useClass: S3ObjectStorageAssetService,
    },
    {
      provide: ObjectStoragePresignerService,
      useClass: S3ObjectStoragePresignerService,
    },
  ],
})
export class MediaStorageModule {}
