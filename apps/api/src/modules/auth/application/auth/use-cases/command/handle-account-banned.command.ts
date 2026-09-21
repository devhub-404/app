import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ACCOUNT_BANNED_EVENT, type AccountBannedEvent } from '@/modules/account/public/events';
import { RevokeAllSessionsCommand } from '@/modules/auth/application/sessions/use-cases/command/revoke-all-sessions.command';

@Injectable()
export class HandleAccountBannedCommand {
  constructor(private readonly revokeAllSessionsCommand: RevokeAllSessionsCommand) {}

  @OnEvent(ACCOUNT_BANNED_EVENT)
  async handle(event: AccountBannedEvent): Promise<void> {
    await this.revokeAllSessionsCommand.execute(event.userId);
  }
}
