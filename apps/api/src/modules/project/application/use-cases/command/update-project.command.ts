import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { ProjectRepository } from '@/modules/project/application/ports/repositories/project.repository';
import { ProjectAccessService } from '../../policies/project-access.service';
import type { UpdateProjectDTO, ProjectDTO } from '../../dtos';
@Injectable()
export class UpdateProjectCommand {
  constructor(
    private readonly r: ProjectRepository,
    private readonly t: TaxonomyPublicServicePort,
    private readonly access: ProjectAccessService,
  ) {}
  async execute(accountId: string, id: string, input: UpdateProjectDTO): Promise<ProjectDTO> {
    const current = await this.r.getById(id);
    if (!current) throw new AppError('CONTENT_NOT_FOUND');
    this.access.assertCanManage(accountId, current);
    const classification = await this.t.validateTags(input.tagSlugs, accountId);
    const { tagSlugs: _, ...data } = input;

    return this.r.transaction(async (context) => {
      const project = await this.r.update(id, data, context);
      if (!project) throw new AppError('CONTENT_NOT_FOUND');
      await this.t.setResourceClassification(id, classification, context);

      return { ...project, tagSlugs: input.tagSlugs };
    });
  }
}
