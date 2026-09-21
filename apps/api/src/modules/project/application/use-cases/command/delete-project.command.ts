import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ProjectRepository } from '@/modules/project/application/ports/repositories/project.repository';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { Role } from '@/shared/kernel/auth/role';
import { ProjectAccessService } from '../../policies/project-access.service';
@Injectable()
export class DeleteProjectCommand {
  constructor(
    private readonly r: ProjectRepository,
    private readonly access: ProjectAccessService,
  ) {}
  async execute(user: User, id: string): Promise<void> {
    const canDeleteAny = user.role === Role.ADMIN;
    if (canDeleteAny) {
      if (!(await this.r.remove(id))) throw new AppError('CONTENT_NOT_FOUND');

      return;
    }
    const current = await this.r.getById(id);
    if (!current) throw new AppError('CONTENT_NOT_FOUND');
    this.access.assertCanManage(user.sub, current);
    if (!(await this.r.remove(id))) throw new AppError('CONTENT_NOT_FOUND');
  }
}
