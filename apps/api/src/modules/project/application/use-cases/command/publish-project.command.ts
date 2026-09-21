import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { ProjectRepository } from '@/modules/project/application/ports/repositories/project.repository';
import { ProjectAccessService } from '../../policies/project-access.service';
import { enrichProject } from '../../project-view';
@Injectable()
export class PublishProjectCommand {
  constructor(
    private readonly r: ProjectRepository,
    private readonly t: TaxonomyPublicServicePort,
    private readonly access: ProjectAccessService,
  ) {}
  async execute(accountId: string, id: string) {
    const current = await this.r.getById(id);
    if (!current) throw new AppError('CONTENT_NOT_FOUND');
    this.access.assertCanManage(accountId, current);
    const saved = await this.r.publish(id);
    if (!saved) throw new AppError('CONTENT_NOT_FOUND');

    return enrichProject(this.t, saved);
  }
}
