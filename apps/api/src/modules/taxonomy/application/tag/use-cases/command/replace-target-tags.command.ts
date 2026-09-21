import { Injectable } from '@nestjs/common';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';

@Injectable()
export class ReplaceTargetTagsCommand {
  constructor(private readonly taxonomy: TaxonomyPublicServicePort) {}
  async execute(resourceId: string, tagSlugs: string[], suggestedById: string, context?: unknown): Promise<void> {
    const classification = await this.taxonomy.validateTags(tagSlugs, suggestedById);
    await this.taxonomy.setResourceClassification(resourceId, classification, context);
  }
}
