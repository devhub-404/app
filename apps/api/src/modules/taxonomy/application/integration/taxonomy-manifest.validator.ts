import { Injectable } from '@nestjs/common';
import { Tag } from '@/modules/taxonomy/domain/tag';

export type TaxonomyManifest = {
  tagSlugs: string[];
};

@Injectable()
export class TaxonomyManifestValidator {
  validate(manifest: TaxonomyManifest): TaxonomyManifest {
    const tagSlugs = manifest.tagSlugs.map((slug) => Tag.normalizeSlug(slug)).filter(Boolean);
    if (tagSlugs.length > 5) throw new Error('TAXONOMY_MANIFEST_TOO_MANY_TAGS');
    if (new Set(tagSlugs).size !== tagSlugs.length) throw new Error('TAXONOMY_MANIFEST_DUPLICATE_TAG');

    return { tagSlugs };
  }
}
