import { Inject, Injectable } from '@nestjs/common';
import type { S3Client } from '@aws-sdk/client-s3';
import { MEDIA_CONFIG, type MediaConfig } from '@/modules/media/public/media-config.port';
import { loadS3Sdk } from './s3-sdk';

@Injectable()
export class LazyS3Client {
  private client: S3Client | undefined;

  constructor(@Inject(MEDIA_CONFIG) private readonly config: MediaConfig) {}

  getClient(): S3Client {
    if (!this.client) {
      const { S3Client } = loadS3Sdk();
      this.client = new S3Client({
        region: 'auto',
        endpoint: this.config.storage.endpoint,
        forcePathStyle: true,
        credentials: {
          accessKeyId: this.config.storage.accessKeyId,
          secretAccessKey: this.config.storage.secretAccessKey,
        },
      });
    }

    return this.client;
  }
}
