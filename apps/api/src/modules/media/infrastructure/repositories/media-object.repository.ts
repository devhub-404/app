import { and, eq, lt } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { MediaObject } from '@/modules/media/domain/media-object';
import {
  MediaObjectRepository,
  type CreateMediaObjectInput,
  type MediaObjectRecord,
} from '@/modules/media/application/ports/repositories/media-object.repository';
import { mediaObjectsSchema } from '@/shared/infrastructure/database/drizzle/schema/media/media-objects.schema';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';

@Injectable()
export class DrizzleMediaObjectRepository implements MediaObjectRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async create(input: CreateMediaObjectInput): Promise<MediaObjectRecord> {
    const media = MediaObject.create(randomUUID(), input);
    const [row] = await this.db.insert(mediaObjectsSchema).values(media.value).returning();

    return row;
  }

  async findOwnedById(ownerAccountId: string, id: string): Promise<MediaObjectRecord | null> {
    const [row] = await this.db
      .select()
      .from(mediaObjectsSchema)
      .where(and(eq(mediaObjectsSchema.ownerAccountId, ownerAccountId), eq(mediaObjectsSchema.id, id)));

    return row ?? null;
  }

  async findById(id: string): Promise<MediaObjectRecord | null> {
    const [row] = await this.db.select().from(mediaObjectsSchema).where(eq(mediaObjectsSchema.id, id));

    return row ?? null;
  }

  async confirm(id: string): Promise<MediaObjectRecord> {
    const current = await this.findById(id);
    if (!current) throw new Error('MEDIA_OBJECT_NOT_FOUND');
    const media = MediaObject.rehydrate(current);
    media.confirm();
    if (current.status === 'confirmed') return current;
    const { id: _id, ...confirmed } = media.value;

    const [row] = await this.db
      .update(mediaObjectsSchema)
      .set(confirmed)
      .where(eq(mediaObjectsSchema.id, id))
      .returning();

    return row;
  }

  async markDeleted(id: string): Promise<void> {
    const current = await this.findById(id);
    if (!current) return;
    const media = MediaObject.rehydrate(current);
    media.delete();
    const { id: _id, ...deleted } = media.value;

    await this.db.update(mediaObjectsSchema).set(deleted).where(eq(mediaObjectsSchema.id, id));
  }

  async findPendingCreatedBefore(cutoff: string): Promise<MediaObjectRecord[]> {
    return await this.db
      .select()
      .from(mediaObjectsSchema)
      .where(and(eq(mediaObjectsSchema.status, 'pending'), lt(mediaObjectsSchema.createdAt, cutoff)));
  }

  async findConfirmedObjectKeys(): Promise<string[]> {
    const rows = await this.db
      .select({ objectKey: mediaObjectsSchema.objectKey })
      .from(mediaObjectsSchema)
      .where(eq(mediaObjectsSchema.status, 'confirmed'));

    return rows.map((row) => row.objectKey);
  }
}
