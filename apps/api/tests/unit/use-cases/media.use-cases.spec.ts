import { describe, expect, it, vi } from 'vitest';
import { RequestMediaUploadCommand } from '@/modules/media/application/use-cases/request-media-upload.command';
import { ConfirmMediaUploadCommand } from '@/modules/media/application/use-cases/confirm-media-upload.command';
import { MediaService } from '@/modules/media/infrastructure/media.service';
import { AppError } from '@/shared/errors/app-error';
import { mediaConfig } from '../helpers/module-config';

function service(metadata: Record<string, unknown> | null = { contentType: 'image/webp', sizeBytes: 100 }) {
  const deleted: string[] = [];
  const storage = {
    getObjectMetadata: async () => metadata,
    deleteObject: async (_bucket: string, key: string) => deleted.push(key),
  };
  const presigner = {
    createPutObjectUrl: async () => ({
      url: 'https://upload.example/object',
      key: 'covers/image.png',
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
      expiresInSeconds: 3600,
    }),
  };

  const mediaObject = {
    id: 'media-1',
    ownerAccountId: 'user-1',
    purpose: 'content',
    objectKey: 'covers/image.png',
    contentType: 'image/webp',
    size: 100,
    status: 'pending',
  };
  const repository = {
    create: async () => mediaObject,
    findOwnedById: async (_ownerId: string, mediaId: string) => (mediaId === mediaObject.id ? mediaObject : null),
    confirm: async () => ({ ...mediaObject, status: 'confirmed' }),
    markDeleted: async () => undefined,
  };

  return { service: new MediaService(mediaConfig, storage as never, presigner as never, repository as never), deleted };
}

describe('MediaService', () => {
  it('creates a direct upload and returns the media id', async () => {
    const value = service();
    const result = await value.service.createImageUpload({
      ownerId: 'user-1',
      purpose: 'content',
      contentType: 'image/webp',
      sizeBytes: 100,
    });

    expect(result).toMatchObject({
      uploadUrl: 'https://upload.example/object',
      mediaId: 'media-1',
    });
  });

  it('rejects unsupported purposes', async () => {
    const value = service();
    await expect(
      value.service.createImageUpload({
        ownerId: 'user-1',
        purpose: 'unsupported' as never,
        contentType: 'image/webp',
        sizeBytes: 100,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('rejects unsupported content types, sizes and expiration windows before presigning', async () => {
    const value = service();
    const base = { ownerId: 'user-1', purpose: 'content' as const, contentType: 'image/webp', sizeBytes: 100 };
    await expect(value.service.createImageUpload({ ...base, contentType: 'image/png' })).rejects.toThrow(
      'UPLOAD_INVALID_CONTENT_TYPE',
    );
    await expect(value.service.createImageUpload({ ...base, sizeBytes: 0 })).rejects.toThrow('UPLOAD_INVALID_SIZE');
    await expect(value.service.createImageUpload({ ...base, expiresInSeconds: 3601 })).rejects.toThrow(
      'UPLOAD_INVALID_EXPIRATION',
    );
  });

  it('confirms an owned object after checking its metadata', async () => {
    const value = service();
    const result = await value.service.confirmImageUpload({
      ownerId: 'user-1',
      purpose: 'content',
      mediaId: 'media-1',
    });

    expect(result?.objectKey).toBe('covers/image.png');
  });

  it('does not confirm an upload when the object is missing or has different metadata', async () => {
    const missing = service(null);
    await expect(
      missing.service.confirmImageUpload({ ownerId: 'user-1', purpose: 'content', mediaId: 'media-1' }),
    ).resolves.toBeNull();

    const wrongSize = service({ contentType: 'image/webp', sizeBytes: 99 });
    await expect(
      wrongSize.service.confirmImageUpload({ ownerId: 'user-1', purpose: 'content', mediaId: 'media-1' }),
    ).resolves.toBeNull();
  });

  it('does not confirm an object owned by another user', async () => {
    const value = service();
    await expect(
      value.service.confirmImageUpload({
        ownerId: 'user-1',
        purpose: 'content',
        mediaId: 'media-2',
      }),
    ).resolves.toBeNull();
  });

  it('does not confirm a media object for a different purpose or a deleted object', async () => {
    const value = service();
    await expect(
      value.service.confirmImageUpload({ ownerId: 'user-1', purpose: 'avatar', mediaId: 'media-1' }),
    ).resolves.toBeNull();
    await expect(
      value.service.confirmImageUpload({ ownerId: 'user-1', purpose: 'content', mediaId: 'media-2' }),
    ).resolves.toBeNull();
  });

  it('accepts only confirmed content media as a content reference', async () => {
    const value = service();
    await expect(value.service.isAcceptedImage({ ownerId: 'user-1', mediaId: 'media-1' })).resolves.toBe(false);
  });

  it('deletes an owned object', async () => {
    const value = service();
    await expect(
      value.service.deleteImage({
        ownerId: 'user-1',
        mediaId: 'media-1',
      }),
    ).resolves.toBe(true);
    expect(value.deleted).toEqual(['covers/image.png']);
  });
});

describe('MEDIA-BE-UC-001/002 — Media application commands', () => {
  it('MEDIA-BE-UC-001 RequestMediaUploadCommand forwards authenticated ownership/purpose constraints to Media', async () => {
    const createImageUpload = vi.fn(async () => ({ mediaId: 'media-1', uploadUrl: 'https://upload.example' }));
    const input = { ownerId: 'user-1', purpose: 'avatar' as const, contentType: 'image/webp', sizeBytes: 123 };
    await expect(new RequestMediaUploadCommand({ createImageUpload } as never).execute(input)).resolves.toMatchObject({
      mediaId: 'media-1',
    });
    expect(createImageUpload).toHaveBeenCalledWith(input);
  });

  it('MEDIA-BE-UC-002 ConfirmMediaUploadCommand confirms only the exact owned media reference supplied by the caller', async () => {
    const confirmImageUpload = vi.fn(async () => ({ mediaId: 'media-1', objectKey: 'avatars/media-1.webp' }));
    const input = { ownerId: 'user-1', purpose: 'avatar' as const, mediaId: 'media-1' };
    await expect(new ConfirmMediaUploadCommand({ confirmImageUpload } as never).execute(input)).resolves.toMatchObject({
      objectKey: 'avatars/media-1.webp',
    });
    expect(confirmImageUpload).toHaveBeenCalledWith(input);
  });
});
