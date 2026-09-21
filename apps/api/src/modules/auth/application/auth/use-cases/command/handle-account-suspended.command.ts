import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ACCOUNT_SUSPENDED_EVENT, type AccountSuspendedEvent } from '@/modules/account/public/events';
import { RevokeAllSessionsCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-all-sessions.command';

@Injectable()
export class HandleAccountSuspendedCommand {
  constructor(private readonly revokeAllSessionsCommand: RevokeAllSessionsCommand) {}

  @OnEvent(ACCOUNT_SUSPENDED_EVENT)
  async handle(event: AccountSuspendedEvent): Promise<void> {
    await this.revokeAllSessionsCommand.execute(event.userId);
  }
}
