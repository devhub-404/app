import { eq } from 'drizzle-orm';
import { Tag } from '@/modules/taxonomy/domain/tag';
import { tagsSchema } from '@/shared/infrastructure/database/drizzle/schema/taxonomy/tags.schema';
import { resourceTagAssignmentsSchema } from '@/shared/infrastructure/database/drizzle/schema/taxonomy/resource-tags.schema';
import { Inject, Injectable } from '@nestjs/common';
import { TagRepository } from '@/modules/taxonomy/application/tag/ports/tag.repository';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';

@Injectable()
export class DrizzleTagRepository implements TagRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async findById(id: string): Promise<Tag | null> {
    const [row] = await this.db.select().from(tagsSchema).where(eq(tagsSchema.id, id));

    if (!row) return null;

    return Tag.rehydrate({
      id: row.id,
      name: row.name,
      slug: row.slug,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async create(props: { name: string; slug: string }): Promise<void> {
    const [row] = await this.db
      .insert(tagsSchema)
      .values({ name: props.name, slug: props.slug, status: 'active' })
      .returning({ id: tagsSchema.id });

    if (!row) throw new Error('Tag nao encontrado apos criacao.');
  }

  async save(tag: Tag): Promise<void> {
    const [row] = await this.db
      .update(tagsSchema)
      .set({ name: tag.name, slug: tag.slug, status: tag.status, updatedAt: tag.updatedAt })
      .where(eq(tagsSchema.id, tag.id))
      .returning({ id: tagsSchema.id });

    if (!row) throw new Error('Tag nao encontrado para atualizacao.');
  }

  async delete(id: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(resourceTagAssignmentsSchema).where(eq(resourceTagAssignmentsSchema.tagId, id));
      await tx.delete(tagsSchema).where(eq(tagsSchema.id, id));
    });
  }

  async setStatus(id: string, status: Tag['status']): Promise<void> {
    await this.db.update(tagsSchema).set({ status, updatedAt: new Date().toISOString() }).where(eq(tagsSchema.id, id));
  }
}
