import { Injectable } from '@nestjs/common';
import { ModerationAccountRestrictionPort } from '@/modules/moderation/public';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { ProjectRepository } from '@/modules/project/application/ports/repositories/project.repository';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';
import type { SaveProjectDTO, ProjectDTO } from '../../dtos';

@Injectable()
export class CreateProjectCommand {
  constructor(
    private readonly r: ProjectRepository,
    private readonly t: TaxonomyPublicServicePort,
    private readonly restrictions: ModerationAccountRestrictionPort,
    private readonly resources: ResourceIdentityPort,
  ) {}

  async execute(accountId: string, input: SaveProjectDTO): Promise<ProjectDTO> {
    await this.restrictions.assertAccountCapability(accountId, 'CONTRIBUTION');
    const classification = await this.t.validateTags(input.tagSlugs, accountId);
    const { tagSlugs: _, ...data } = input;

    return this.r.transaction(async (context) => {
      const identity = await this.resources.create('project', context);
      const project = await this.r.create(identity.id, accountId, data, context);
      await this.t.setResourceClassification(project.id, classification, context);

      return { ...project, tagSlugs: input.tagSlugs };
    });
  }
}
