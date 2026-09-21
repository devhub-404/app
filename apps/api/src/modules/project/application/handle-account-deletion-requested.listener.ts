import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ACCOUNT_DELETION_REQUESTED_EVENT, type AccountDeletionRequestedEvent } from '@/modules/account/public/events';
import { ProjectRepository } from '@/modules/project/application/ports/repositories/project.repository';

@Injectable()
export class HandleProjectAccountDeletionRequestedListener {
  constructor(private readonly repository: ProjectRepository) {}

  @OnEvent(ACCOUNT_DELETION_REQUESTED_EVENT)
  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    await this.repository.archiveAllByAuthor(event.userId);
  }
}
