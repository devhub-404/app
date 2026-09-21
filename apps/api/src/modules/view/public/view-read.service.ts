import { Injectable } from '@nestjs/common';
import { ViewRepository } from '@/modules/view/application/views/view.repository';
import { ViewReadPort } from './view-read.port';

@Injectable()
export class ViewReadService implements ViewReadPort {
  constructor(private readonly views: ViewRepository) {}
  countMany(resourceIds: string[]) {
    return this.views.countMany(resourceIds);
  }
}
