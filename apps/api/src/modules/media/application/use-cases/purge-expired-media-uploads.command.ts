import { Inject, Injectable, Logger } from '@nestjs/common';
import { MEDIA_CONFIG, type MediaConfig } from '@/modules/media/public/media-config.port';
import { MediaObjectRepository } from '@/modules/media/application/ports/repositories/media-object.repository';
import { ObjectStorageAssetService } from '@/modules/media/application/ports/object-storage-asset.service';

const MEDIA_RETENTION_DAYS = 30;
const DEFAULT_MANAGED_PREFIXES = ['avatars/', 'content/'] as const;

@Injectable()
export class PurgeExpiredMediaUploadsCommand {
  private readonly logger = new Logger(PurgeExpiredMediaUploadsCommand.name);

  constructor(
    private readonly repository: MediaObjectRepository,
    private readonly storage: ObjectStorageAssetService,
    @Inject(MEDIA_CONFIG) private readonly config: MediaConfig,
  ) {}

  async execute(olderThanDays = MEDIA_RETENTION_DAYS): Promise<number> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const cutoff = cutoffDate.toISOString();
    const pending = await this.repository.findPendingCreatedBefore(cutoff);
    let purged = 0;
    const deletedKeys = new Set<string>();

    for (const media of pending) {
      try {
        await this.storage.deleteObject(this.config.storage.bucket, media.objectKey);
        await this.repository.markDeleted(media.id);
        deletedKeys.add(media.objectKey);
        purged += 1;
      } catch (error) {
        this.logger.warn(`Unable to purge expired media upload ${media.id}: ${String(error)}`);
      }
    }

    const confirmedKeys = new Set(
      this.repository.findConfirmedObjectKeys ? await this.repository.findConfirmedObjectKeys() : [],
    );
    const prefixes = this.config.storage.managedPrefixes ?? DEFAULT_MANAGED_PREFIXES;

    for (const prefix of prefixes) {
      let objects;
      try {
        objects = await this.storage.listObjects(this.config.storage.bucket, prefix);
      } catch (error) {
        this.logger.warn(`Unable to list media objects under ${prefix}: ${String(error)}`);
        continue;
      }

      for (const object of objects) {
        if (
          confirmedKeys.has(object.key) ||
          deletedKeys.has(object.key) ||
          !object.lastModified ||
          object.lastModified.getTime() >= cutoffDate.getTime()
        ) {
          continue;
        }

        try {
          await this.storage.deleteObject(this.config.storage.bucket, object.key);
          deletedKeys.add(object.key);
          purged += 1;
        } catch (error) {
          this.logger.warn(`Unable to purge orphaned media object ${object.key}: ${String(error)}`);
        }
      }
    }

    return purged;
  }
}
