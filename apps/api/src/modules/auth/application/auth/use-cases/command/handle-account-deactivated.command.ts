import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ACCOUNT_DEACTIVATED_EVENT, type AccountDeactivatedEvent } from '@/modules/account/public/events';
import { RevokeAllSessionsCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-all-sessions.command';

@Injectable()
export class HandleAccountDeactivatedCommand {
  constructor(private readonly revokeAllSessionsCommand: RevokeAllSessionsCommand) {}

  @OnEvent(ACCOUNT_DEACTIVATED_EVENT)
  async handle(event: AccountDeactivatedEvent): Promise<void> {
    await this.revokeAllSessionsCommand.execute(event.userId);
  }
}
