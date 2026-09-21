import { Injectable } from '@nestjs/common';
import type {
  ObjectStorageAssetService,
  ObjectStorageObject,
  ObjectStorageObjectMetadata,
} from '@/modules/media/application/ports/object-storage-asset.service';
import { Inject } from '@nestjs/common';
import { LazyS3Client } from './lazy-s3-client.service';
import { loadS3Sdk } from './s3-sdk';

@Injectable()
export class S3ObjectStorageAssetService implements ObjectStorageAssetService {
  constructor(@Inject(LazyS3Client) private readonly s3: LazyS3Client) {}

  async putObject(
    bucket: string,
    key: string,
    body: Uint8Array,
    metadata: { contentType: string; contentLength: number },
  ): Promise<void> {
    const { PutObjectCommand } = loadS3Sdk();
    await this.s3.getClient().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: metadata.contentType,
        ContentLength: metadata.contentLength,
      }),
    );
  }

  async getObjectMetadata(bucket: string, key: string): Promise<ObjectStorageObjectMetadata | null> {
    try {
      const { HeadObjectCommand } = loadS3Sdk();
      const result = await this.s3.getClient().send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );

      return {
        contentType: result.ContentType ?? null,
        sizeBytes: result.ContentLength ?? null,
      };
    } catch {
      return null;
    }
  }

  async listObjects(bucket: string, prefix: string): Promise<ObjectStorageObject[]> {
    const { ListObjectsV2Command } = loadS3Sdk();
    const objects: ObjectStorageObject[] = [];
    let continuationToken: string | undefined;

    do {
      const result = await this.s3.getClient().send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          ...(continuationToken ? { ContinuationToken: continuationToken } : {}),
        }),
      );

      for (const object of result.Contents ?? []) {
        if (object.Key) objects.push({ key: object.Key, lastModified: object.LastModified ?? null });
      }

      continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
    } while (continuationToken);

    return objects;
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    const { DeleteObjectCommand } = loadS3Sdk();
    await this.s3.getClient().send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  }
}
