import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Inject } from '@nestjs/common';
import { MEDIA_CONFIG, type MediaConfig } from '@/modules/media/public/media-config.port';
import { AppError } from '@/shared/errors/app-error';
import { ObjectStorageAssetService } from '@/modules/media/application/ports/object-storage-asset.service';
import { ObjectStoragePresignerService } from '@/modules/media/application/ports/object-storage-presigner.service';
import { MediaObjectRepository } from '@/modules/media/application/ports/repositories/media-object.repository';
import { resolvePublicMediaUrl } from '@/shared/infrastructure/media/media-url';
import {
  type ConfirmedImageAsset,
  type ConfirmImageUploadInput,
  type CreateImageUploadInput,
  type CreatedImageUpload,
  type DeleteImageInput,
  MediaServicePort,
  type MediaUploadPurpose,
} from '@/modules/media/public/media.service.port';
import type { ImportOAuthAvatarInput } from '@/modules/media/public/media.service.port';
import sharp from 'sharp';

function isSupportedPurpose(value: string): value is MediaUploadPurpose {
  return value === 'avatar' || value === 'content';
}

function contentTypeToExtension(contentType: string): string | null {
  switch (contentType) {
    case 'image/webp':
      return 'webp';
    default:
      return null;
  }
}

function resolvePrefix(purpose: MediaUploadPurpose): string {
  switch (purpose) {
    case 'avatar':
      return 'avatars';
    case 'content':
      return 'content';
  }
}

@Injectable()
export class MediaService implements MediaServicePort {
  private readonly logger = new Logger(MediaService.name);
  constructor(
    @Inject(MEDIA_CONFIG) private readonly config: MediaConfig,
    private readonly objectStorageAssetService: ObjectStorageAssetService,
    private readonly presigner: ObjectStoragePresignerService,
    private readonly mediaObjectRepository: MediaObjectRepository,
  ) {}

  async isAcceptedImage(input: { ownerId: string; mediaId: string }): Promise<boolean> {
    const mediaObject = await this.mediaObjectRepository.findOwnedById(input.ownerId, input.mediaId);

    return Boolean(mediaObject && mediaObject.status === 'confirmed' && mediaObject.purpose === 'content');
  }

  async createImageUpload(input: CreateImageUploadInput): Promise<CreatedImageUpload> {
    if (!isSupportedPurpose(input.purpose)) {
      throw new AppError('UPLOAD_INVALID_PURPOSE');
    }

    if (!this.config.upload.allowedContentTypes.includes(input.contentType)) {
      throw new AppError('UPLOAD_INVALID_CONTENT_TYPE');
    }

    if (
      !Number.isInteger(input.sizeBytes) ||
      input.sizeBytes <= 0 ||
      input.sizeBytes > this.config.upload.maxBytes[input.purpose]
    ) {
      throw new AppError('UPLOAD_INVALID_SIZE');
    }

    const extension = contentTypeToExtension(input.contentType);
    if (!extension) {
      throw new AppError('UPLOAD_INVALID_CONTENT_TYPE');
    }

    const expiresInSeconds = input.expiresInSeconds ?? this.config.upload.grantTtlSeconds;
    if (
      !Number.isInteger(expiresInSeconds) ||
      expiresInSeconds <= 0 ||
      expiresInSeconds > this.config.upload.grantTtlSeconds
    ) {
      throw new AppError('UPLOAD_INVALID_EXPIRATION');
    }
    // Storage organization is by media type. Ownership remains authoritative
    // in media_objects.owner_account_id and is enforced on confirm/delete.
    const key = `${resolvePrefix(input.purpose)}/${randomUUID()}.${extension}`;
    const presigned = await this.presigner.createPutObjectUrl({
      bucket: this.config.storage.bucket,
      key,
      contentType: input.contentType,
      contentLength: input.sizeBytes,
      expiresInSeconds,
    });

    const mediaObject = await this.mediaObjectRepository.create({
      ownerAccountId: input.ownerId,
      purpose: input.purpose,
      objectKey: presigned.key,
      contentType: input.contentType,
      size: input.sizeBytes,
    });

    return {
      mediaId: mediaObject.id,
      uploadUrl: presigned.url,
      expiresInSeconds: presigned.expiresInSeconds,
      expiresAt: presigned.expiresAt,
    };
  }

  async confirmImageUpload(input: ConfirmImageUploadInput): Promise<ConfirmedImageAsset | null> {
    const mediaObject = await this.mediaObjectRepository.findOwnedById(input.ownerId, input.mediaId);
    if (!mediaObject || mediaObject.status === 'deleted' || mediaObject.purpose !== input.purpose) {
      return null;
    }

    const metadata = await this.objectStorageAssetService.getObjectMetadata(
      this.config.storage.bucket,
      mediaObject.objectKey,
    );
    if (!metadata || metadata.contentType !== mediaObject.contentType || metadata.sizeBytes !== mediaObject.size) {
      return null;
    }

    const objectKey = mediaObject.objectKey;
    if (mediaObject.status === 'pending') await this.mediaObjectRepository.confirm(mediaObject.id);

    return {
      mediaId: mediaObject.id,
      objectKey,
      url: resolvePublicMediaUrl(objectKey, this.config),
    };
  }

  async deleteImage(input: DeleteImageInput): Promise<boolean> {
    const mediaObject = await this.mediaObjectRepository.findOwnedById(input.ownerId, input.mediaId);
    if (!mediaObject || mediaObject.status === 'deleted') return false;

    await this.objectStorageAssetService.deleteObject(this.config.storage.bucket, mediaObject.objectKey);
    await this.mediaObjectRepository.markDeleted(mediaObject.id);

    return true;
  }

  async importOAuthAvatar(input: ImportOAuthAvatarInput): Promise<ConfirmedImageAsset | null> {
    if (input.purpose !== 'avatar' || !isAllowedOAuthAvatarUrl(input.sourceUrl, input.provider)) return null;

    const original = await downloadImage(input.sourceUrl, input.provider, this.config.upload.maxBytes.avatar);
    if (!original) return null;

    let converted: Buffer;
    try {
      converted = await sharp(original, { limitInputPixels: 4_000_000 })
        .rotate()
        .resize(512, 512, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch (error) {
      this.logger.warn(`OAuth avatar conversion failed for ${input.provider}: ${String(error)}`);

      return null;
    }

    if (converted.byteLength === 0 || converted.byteLength > this.config.upload.maxBytes.avatar) return null;

    const objectKey = `${resolvePrefix('avatar')}/${randomUUID()}.webp`;
    const mediaObject = await this.mediaObjectRepository.create({
      ownerAccountId: input.ownerId,
      purpose: 'avatar',
      objectKey,
      contentType: 'image/webp',
      size: converted.byteLength,
    });

    try {
      await this.objectStorageAssetService.putObject(this.config.storage.bucket, objectKey, converted, {
        contentType: 'image/webp',
        contentLength: converted.byteLength,
      });
      const confirmed = await this.mediaObjectRepository.confirm(mediaObject.id);

      return {
        mediaId: confirmed.id,
        objectKey: confirmed.objectKey,
        url: resolvePublicMediaUrl(confirmed.objectKey, this.config),
      };
    } catch (error) {
      this.logger.warn(`OAuth avatar storage failed for ${input.ownerId}: ${String(error)}`);
      await this.objectStorageAssetService.deleteObject(this.config.storage.bucket, objectKey).catch(() => undefined);
      await this.mediaObjectRepository.markDeleted(mediaObject.id).catch(() => undefined);

      return null;
    }
  }
}

function isAllowedOAuthAvatarUrl(value: string, provider: ImportOAuthAvatarInput['provider']): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return false;
    const hostname = url.hostname.toLowerCase();
    if (provider === 'github') return hostname === 'avatars.githubusercontent.com';

    return hostname === 'lh3.googleusercontent.com' || hostname.endsWith('.googleusercontent.com');
  } catch {
    return false;
  }
}

async function downloadImage(
  initialUrl: string,
  provider: ImportOAuthAvatarInput['provider'],
  maxBytes: number,
): Promise<Buffer | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    const source = new URL(initialUrl);
    source.searchParams.set('devhub_avatar_refresh', Date.now().toString());
    let url = source.toString();
    let response: Response;
    for (let redirect = 0; redirect <= 3; redirect += 1) {
      response = await fetch(url, {
        signal: controller.signal,
        redirect: 'manual',
        headers: { Accept: 'image/*', 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get('location');
      if (!location || redirect === 3) return null;
      url = new URL(location, url).toString();
      if (!isAllowedOAuthAvatarUrl(url, provider)) return null;
    }
    if (!response!.ok || !response!.body) return null;
    const contentLength = Number(response!.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > maxBytes) return null;

    const reader = response!.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      total += part.value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();

        return null;
      }
      chunks.push(part.value);
    }

    return Buffer.concat(
      chunks.map((chunk) => Buffer.from(chunk)),
      total,
    );
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
