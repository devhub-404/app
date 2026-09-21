import { Injectable } from '@nestjs/common';
import type {
  ObjectStoragePresignerService,
  PresignedPutObjectRequest,
  PresignedPutObjectResponse,
} from '@/modules/media/application/ports/object-storage-presigner.service';
import { Inject } from '@nestjs/common';
import { LazyS3Client } from './lazy-s3-client.service';
import { loadS3Presigner, loadS3Sdk } from './s3-sdk';

@Injectable()
export class S3ObjectStoragePresignerService implements ObjectStoragePresignerService {
  constructor(@Inject(LazyS3Client) private readonly s3: LazyS3Client) {}

  async createPutObjectUrl(request: PresignedPutObjectRequest): Promise<PresignedPutObjectResponse> {
    const { PutObjectCommand } = loadS3Sdk();
    const { getSignedUrl } = loadS3Presigner();
    const command = new PutObjectCommand({
      Bucket: request.bucket,
      Key: request.key,
      ContentType: request.contentType,
      // Do not sign ContentLength: browsers cannot set this forbidden header
      // explicitly. The upload grant records the expected size and
      // confirmImageUpload validates the stored object's size before publish.
    });

    const url = await getSignedUrl(this.s3.getClient(), command, { expiresIn: request.expiresInSeconds });
    const expiresAt = new Date(Date.now() + request.expiresInSeconds * 1000).toISOString();

    return {
      bucket: request.bucket,
      key: request.key,
      url,
      expiresInSeconds: request.expiresInSeconds,
      expiresAt,
    };
  }
}
