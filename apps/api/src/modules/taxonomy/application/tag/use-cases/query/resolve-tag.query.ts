import { Injectable } from '@nestjs/common';
import { Tag } from '@/modules/taxonomy/domain/tag';
import { TagQueryRepository } from '@/modules/taxonomy/application/tag/ports/tag.query.repository';
import { TagWorkflowRepository } from '@/modules/taxonomy/application/tag/ports/tag-workflow.repository';
import { TagIdentityRepository } from '@/modules/taxonomy/application/tag/ports/tag-identity.repository';

@Injectable()
export class ResolveTagQuery {
  constructor(
    private readonly tags: TagQueryRepository,
    private readonly workflow: TagWorkflowRepository,
    private readonly identities: TagIdentityRepository,
  ) {}
  async execute(value: string) {
    const normalized = Tag.normalizeSlug(value);
    const direct = await this.tags.findBySlug(normalized);
    const byName = direct ?? (await this.tags.findByName(value));
    if (byName) {
      const mergedTargetId = await this.workflow.resolveMergedTag(byName.id);
      if (mergedTargetId) {
        const target = await this.tags.findById(mergedTargetId);

        return target ?? null;
      }

      return byName;
    }
    const aliasTargetId = await this.identities.findCanonicalTagIdByAlias(normalized);
    if (!aliasTargetId) return null;
    const aliasTarget = await this.tags.findById(aliasTargetId);
    if (!aliasTarget) return null;
    const mergedTargetId = await this.workflow.resolveMergedTag(aliasTarget.id);
    if (mergedTargetId) {
      const target = await this.tags.findById(mergedTargetId);

      return target ?? null;
    }

    return aliasTarget;
  }
}
