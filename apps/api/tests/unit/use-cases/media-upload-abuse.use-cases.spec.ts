import { describe, expect, it, vi } from 'vitest';
import { PurgeExpiredMediaUploadsCommand } from '@/modules/media/application/use-cases';
import {
  MediaObjectRepository,
  type MediaObjectRecord,
} from '@/modules/media/application/ports/repositories/media-object.repository';
import { ObjectStorageAssetService } from '@/modules/media/application/ports/object-storage-asset.service';

const media = (id: string): MediaObjectRecord => ({
  id,
  ownerAccountId: 'owner-1',
  purpose: 'content',
  objectKey: `content/${id}.webp`,
  contentType: 'image/webp',
  size: 100,
  status: 'pending',
  confirmedAt: null,
  deletedAt: null,
  createdAt: '2020-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
});

describe('expired media upload cleanup', () => {
  it('deletes expired storage objects and marks only successful records deleted', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-31T00:00:00.000Z'));

    const pending = [media('media-1'), media('media-2')];
    const findPendingCreatedBefore = vi.fn(async (_cutoff: string) => pending);
    const markDeleted = vi.fn(async () => undefined);
    const repository = {
      findPendingCreatedBefore,
      findConfirmedObjectKeys: vi.fn(async () => []),
      markDeleted,
    } as unknown as MediaObjectRepository;
    const deleteObject = vi.fn(async (_bucket: string, key: string) => {
      if (key.endsWith('media-2.webp')) throw new Error('temporary storage failure');
    });
    const storage = {
      deleteObject,
      listObjects: vi.fn(async () => []),
    } as unknown as ObjectStorageAssetService;
    const command = new PurgeExpiredMediaUploadsCommand(repository, storage, {
      storage: { bucket: 'bucket' },
    } as never);

    await expect(command.execute()).resolves.toBe(1);
    expect(findPendingCreatedBefore).toHaveBeenCalledWith('2026-08-01T00:00:00.000Z');
    expect(deleteObject).toHaveBeenCalledTimes(2);
    expect(markDeleted).toHaveBeenCalledWith('media-1');
    expect(markDeleted).not.toHaveBeenCalledWith('media-2');
    vi.useRealTimers();
  });

  it('purges old objects without a confirmed Media record and preserves recent or confirmed objects', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-31T00:00:00.000Z'));

    const deleteObject = vi.fn(async () => undefined);
    const listObjects = vi.fn(async (_bucket: string, prefix: string) =>
      prefix === 'avatars/'
        ? [
            { key: 'avatars/confirmed.webp', lastModified: new Date('2026-07-01T00:00:00.000Z') },
            { key: 'avatars/orphan.webp', lastModified: new Date('2026-07-01T00:00:00.000Z') },
            { key: 'avatars/recent.webp', lastModified: new Date('2026-08-15T00:00:00.000Z') },
          ]
        : [],
    );
    const repository = {
      findPendingCreatedBefore: vi.fn(async () => []),
      findConfirmedObjectKeys: vi.fn(async () => ['avatars/confirmed.webp']),
    } as unknown as MediaObjectRepository;
    const storage = { deleteObject, listObjects } as unknown as ObjectStorageAssetService;
    const command = new PurgeExpiredMediaUploadsCommand(repository, storage, {
      storage: { bucket: 'bucket', managedPrefixes: ['avatars/', 'content/'] },
    } as never);

    await expect(command.execute()).resolves.toBe(1);
    expect(deleteObject).toHaveBeenCalledWith('bucket', 'avatars/orphan.webp');
    expect(deleteObject).not.toHaveBeenCalledWith('bucket', 'avatars/confirmed.webp');
    expect(deleteObject).not.toHaveBeenCalledWith('bucket', 'avatars/recent.webp');
    expect(listObjects).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
