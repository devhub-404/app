import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import type { ProjectDTO } from '../dtos';

@Injectable()
export class ProjectAccessService {
  assertCanManage(accountId: string, project: ProjectDTO): void {
    if (project.authorAccountId === accountId) return;

    throw new AppError('CONTENT_NOT_FOUND');
  }
}
