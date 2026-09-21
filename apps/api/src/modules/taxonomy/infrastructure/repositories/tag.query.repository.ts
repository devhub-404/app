import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { TagQueryRepository } from '@/modules/taxonomy/application/tag/ports/tag.query.repository';
import { TagDTO } from '@/modules/taxonomy/application/tag/dtos/out/tag.dto';
import { tagsSchema } from '@/shared/infrastructure/database/drizzle/schema/taxonomy/tags.schema';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { Tag } from '@/modules/taxonomy/domain/tag';
import { Paginated } from '@/shared/kernel/pagination';
import type { TagSearchCriteria } from '@/modules/taxonomy/application/tag/ports/tag-search.criteria';

@Injectable()
export class DrizzleTagQueryRepository implements TagQueryRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async findBySlug(slug: string): Promise<TagDTO | null> {
    const [row] = await this.db
      .select({
        id: tagsSchema.id,
        name: tagsSchema.name,
        slug: tagsSchema.slug,
        status: tagsSchema.status,
        createdAt: tagsSchema.createdAt,
        updatedAt: tagsSchema.updatedAt,
      })
      .from(tagsSchema)
      .where(eq(tagsSchema.slug, Tag.normalizeSlug(slug)));

    return row
      ? {
          id: row.id,
          name: row.name,
          slug: row.slug,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }
      : null;
  }

  async findByName(name: string): Promise<TagDTO | null> {
    const [row] = await this.db
      .select({
        id: tagsSchema.id,
        name: tagsSchema.name,
        slug: tagsSchema.slug,
        status: tagsSchema.status,
        createdAt: tagsSchema.createdAt,
        updatedAt: tagsSchema.updatedAt,
      })
      .from(tagsSchema)
      .where(ilike(tagsSchema.name, name.trim()));

    return row
      ? {
          id: row.id,
          name: row.name,
          slug: row.slug,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }
      : null;
  }

  async findById(id: string): Promise<TagDTO | null> {
    const [row] = await this.db
      .select({
        id: tagsSchema.id,
        name: tagsSchema.name,
        slug: tagsSchema.slug,
        status: tagsSchema.status,
        createdAt: tagsSchema.createdAt,
        updatedAt: tagsSchema.updatedAt,
      })
      .from(tagsSchema)
      .where(eq(tagsSchema.id, id));

    return row
      ? {
          id: row.id,
          name: row.name,
          slug: row.slug,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }
      : null;
  }

  async search(query: TagSearchCriteria): Promise<TagDTO[]> {
    const value = query.search?.trim() ?? query.slug?.trim() ?? '';
    if (!value) return [];

    const namePattern = `%${value}%`;
    const slugPattern = `${Tag.normalizeSlug(value)}%`;
    const rows = await this.db
      .select({
        id: tagsSchema.id,
        name: tagsSchema.name,
        slug: tagsSchema.slug,
        status: tagsSchema.status,
        createdAt: tagsSchema.createdAt,
        updatedAt: tagsSchema.updatedAt,
      })
      .from(tagsSchema)
      .where(
        and(
          or(ilike(tagsSchema.name, namePattern), ilike(tagsSchema.slug, slugPattern)),
          eq(tagsSchema.status, 'active'),
        ),
      )
      .orderBy(asc(tagsSchema.slug))
      .limit(10)
      .$withCache({ config: { ex: 60 }, autoInvalidate: true });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async searchPage(query: TagSearchCriteria): Promise<Paginated<TagDTO>> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 25));
    const offset = (page - 1) * pageSize;
    const value = query.search?.trim();
    const where = value
      ? or(ilike(tagsSchema.name, `%${value}%`), ilike(tagsSchema.slug, `%${Tag.normalizeSlug(value)}%`))
      : undefined;
    const [rows, countRows] = await Promise.all([
      this.db
        .select({
          id: tagsSchema.id,
          name: tagsSchema.name,
          slug: tagsSchema.slug,
          status: tagsSchema.status,
          createdAt: tagsSchema.createdAt,
          updatedAt: tagsSchema.updatedAt,
        })
        .from(tagsSchema)
        .where(where)
        .orderBy(desc(tagsSchema.updatedAt), desc(tagsSchema.id))
        .limit(pageSize)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(tagsSchema)
        .where(where),
    ]);

    return { items: rows, page, pageSize, total: Number(countRows[0]?.count ?? 0) };
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: tagsSchema.id })
      .from(tagsSchema)
      .where(eq(tagsSchema.slug, Tag.normalizeSlug(slug)));

    return !!row;
  }
}
