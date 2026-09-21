import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ACCOUNT_DELETION_REQUESTED_EVENT, type AccountDeletionRequestedEvent } from '@/modules/account/public/events';
import { RevokeAllSessionsCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-all-sessions.command';

@Injectable()
export class HandleAccountDeletionRequestedCommand {
  constructor(private readonly revokeAllSessionsCommand: RevokeAllSessionsCommand) {}

  @OnEvent(ACCOUNT_DELETION_REQUESTED_EVENT)
  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    await this.revokeAllSessionsCommand.execute(event.userId);
  }
}
