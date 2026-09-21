import { Injectable } from '@nestjs/common';
import {
  ModerationTargetVisibilityPort,
  type HiddenModerationTarget,
} from '../../ports/moderation-target-visibility.port';

@Injectable()
export class ListHiddenTargetsQuery {
  constructor(private readonly visibility: ModerationTargetVisibilityPort) {}

  execute(): Promise<HiddenModerationTarget[]> {
    return this.visibility.listHidden();
  }
}
