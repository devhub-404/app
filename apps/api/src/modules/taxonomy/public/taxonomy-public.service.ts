import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { TagQueryRepository } from '@/modules/taxonomy/application/tag/ports/tag.query.repository';
import { Tag } from '@/modules/taxonomy/domain/tag';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { ResourceTagRepository } from '@/modules/taxonomy/application/ports/repositories/resource-tag.repository';
import type { ResourceClassification } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { TagIdentityRepository } from '@/modules/taxonomy/application/tag/ports/tag-identity.repository';

@Injectable()
export class TaxonomyPublicService implements TaxonomyPublicServicePort {
  constructor(
    private readonly tagQueryRepository: TagQueryRepository,
    private readonly resourceTagRepository: ResourceTagRepository,
    private readonly tagIdentityRepository: TagIdentityRepository,
  ) {}

  async validateTags(tagSlugs: string[], _suggestedById: string): Promise<ResourceClassification> {
    const unique = Array.from(new Set(tagSlugs.map((slug) => Tag.normalizeSlug(slug)).filter(Boolean)));
    if (unique.length > 5) throw new AppError('CONTENT_INVALID_TAG_COUNT');
    const tagSlugsResult: string[] = [];
    for (const slug of unique) {
      const tag = await this.tagQueryRepository.findBySlug(slug);
      if (tag) {
        if (tag.status === 'archived') throw new AppError('TAG_NOT_FOUND');
        tagSlugsResult.push(tag.slug);
        continue;
      }

      const aliasTargetId = await this.tagIdentityRepository.findCanonicalTagIdByAlias(slug);
      if (aliasTargetId) {
        const canonical = await this.tagQueryRepository.findById(aliasTargetId);
        if (!canonical || canonical.status !== 'active') throw new AppError('TAG_NOT_FOUND');
        tagSlugsResult.push(canonical.slug);
        continue;
      }

      const term = await this.tagIdentityRepository.findIdentityTerm(slug);
      if (term?.kind === 'blocked') throw new AppError('TAG_IDENTITY_BLOCKED');
      if (term?.kind === 'reserved') throw new AppError('TAG_IDENTITY_RESERVED');

      throw new AppError('TAG_NOT_FOUND');
    }

    return { tagSlugs: tagSlugsResult };
  }

  async getTagBySlug(slug: string) {
    const normalized = Tag.normalizeSlug(slug);
    const direct = await this.tagQueryRepository.findBySlug(normalized);
    if (direct) return { id: direct.id, name: direct.name, slug: direct.slug, status: direct.status };
    const aliasTargetId = await this.tagIdentityRepository.findCanonicalTagIdByAlias(normalized);
    if (!aliasTargetId) return null;
    const canonical = await this.tagQueryRepository.findById(aliasTargetId);

    return canonical
      ? { id: canonical.id, name: canonical.name, slug: canonical.slug, status: canonical.status }
      : null;
  }

  async getResourceIdsByTagSlugs(tagSlugs: string[]): Promise<string[]> {
    const uniqueSlugs = Array.from(new Set(tagSlugs.map((slug) => Tag.normalizeSlug(slug)).filter(Boolean)));
    if (!uniqueSlugs.length) return [];

    return this.resourceTagRepository.getResourceIdsByTagSlugs(uniqueSlugs);
  }

  async getTagsByResourceIds(resourceIds: string[]): Promise<Record<string, { name: string; slug: string }[]>> {
    const uniqueIds = Array.from(new Set(resourceIds.filter(Boolean)));
    if (!uniqueIds.length) return {};
    const rows = await this.resourceTagRepository.getTagsByResourceIds(uniqueIds);

    return rows.reduce<Record<string, { name: string; slug: string }[]>>((acc, row) => {
      const current = acc[row.resourceId] ?? [];
      current.push({ name: row.name, slug: row.slug });
      acc[row.resourceId] = current;

      return acc;
    }, {});
  }

  getResourceTagSlugs(resourceId: string): Promise<string[]> {
    return this.resourceTagRepository.getResourceTagSlugs(resourceId);
  }

  setResourceClassification(
    resourceId: string,
    classification: ResourceClassification,
    context?: unknown,
  ): Promise<void> {
    return this.resourceTagRepository.setResourceClassification(resourceId, classification, context);
  }
}
