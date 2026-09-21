import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { ProjectQueryRepository } from '@/modules/project/application/ports/repositories/project.query.repository';
import { enrichProject } from '../../project-view';
@Injectable()
export class GetProjectBySlugQuery {
  constructor(
    private readonly r: ProjectQueryRepository,
    private readonly t: TaxonomyPublicServicePort,
  ) {}
  async execute(slug: string, authorAccountId?: string) {
    const p = await this.r.findBySlug(slug, authorAccountId);
    if (!p) throw new AppError('CONTENT_NOT_FOUND');

    return enrichProject(this.t, p);
  }
}
