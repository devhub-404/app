import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { emitBestEffort } from '@/modules/auth/application/shared/emit-best-effort';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { JwtTokenType } from '@/modules/auth/application/shared/dto';
import {
  RESTORE_ACCESS_EMAIL_REQUESTED_EVENT,
  RestoreAccessEmailRequestedEvent,
} from '@/modules/auth/application/core/events/restore-access-email-requested.event';
import { RestoreAccessEmailInputDTO } from '@/modules/auth/application/auth/dtos/in';

@Injectable()
export class RestoreAccessEmailService {
  constructor(
    private readonly flowTokenService: FlowTokenService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: RestoreAccessEmailInputDTO): Promise<void> {
    const token = await this.flowTokenService.signSingleUse({
      type: JwtTokenType.ACCOUNT_DELETION_RESTORE_ACCESS,
      purpose: 'account_deletion_restore_access',
      payload: { sub: input.userId, email: input.email },
      expiresIn: '10m',
    });

    await emitBestEffort(
      this.eventEmitter,
      RESTORE_ACCESS_EMAIL_REQUESTED_EVENT,
      new RestoreAccessEmailRequestedEvent(input.userId, input.email, token),
    );
  }
}
