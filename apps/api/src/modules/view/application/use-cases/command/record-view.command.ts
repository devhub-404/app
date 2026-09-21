import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ViewRepository } from '../../views/view.repository';
import { View } from '@/modules/view/domain';
import { ViewTargetAccessService } from '../../views/view-target-access.service';

@Injectable()
export class RecordViewCommand {
  constructor(
    private readonly views: ViewRepository,
    private readonly access: ViewTargetAccessService,
  ) {}

  async execute(accountId: string, resourceId: string) {
    if (!(await this.access.isViewable(resourceId))) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');
    const view = View.record({ accountId, resourceId });
    await this.views.record(view.value.accountId, view.value.resourceId);

    return { resourceId, views: await this.views.count(resourceId) };
  }
}
