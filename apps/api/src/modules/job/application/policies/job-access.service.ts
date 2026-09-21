import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { OrganizationAccessPort } from '@/modules/organization/public/organization-access.port';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { Role } from '@/shared/kernel/auth/role';
import type { JobDTO } from '../dtos';
@Injectable()
export class JobAccessService {
  constructor(private readonly organizations: OrganizationAccessPort) {}
  async assertCanManage(user: User, job: Omit<JobDTO, 'tagSlugs'>): Promise<void> {
    if (!job.publisherOrganizationId) {
      if (user.role === Role.CURATOR || user.role === Role.ADMIN) return;

      throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');
    }

    return this.organizations.assertCanManage(user.sub, job.publisherOrganizationId);
  }
  async canManage(user: User, job: Omit<JobDTO, 'tagSlugs'>): Promise<boolean> {
    try {
      await this.assertCanManage(user, job);

      return true;
    } catch {
      return false;
    }
  }
}
