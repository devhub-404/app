import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { emitBestEffort } from '@/modules/auth/application/shared/emit-best-effort';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { JwtTokenType } from '@/modules/auth/application/shared/dto';
import { AccountAccessPort } from '@/modules/account/public/account-access.ports';
import { AccountEmailAccessPort } from '@/modules/account/public/account-access.ports';
import { GenericPublicAckDTO } from '@/modules/auth/application/shared/dto';
import {
  ACCOUNT_RECOVERY_EMAIL_REQUESTED_EVENT,
  AccountRecoveryEmailRequestedEvent,
} from '@/modules/auth/application/core/events/account-recovery-email-requested.event';

@Injectable()
export class StartAccountRecoveryCommand {
  constructor(
    private readonly userRepository: AccountAccessPort,
    private readonly userEmailRepository: AccountEmailAccessPort,
    private readonly flowTokenService: FlowTokenService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(email: string): Promise<GenericPublicAckDTO> {
    const emailRow = await this.userEmailRepository.findByEmail(email);
    if (!emailRow || emailRow.type !== 'backup' || !emailRow.verifiedAt) {
      return { acknowledged: true };
    }

    const userRow = await this.userRepository.findById(emailRow.userId);
    if (!userRow || userRow.status === 'banned') {
      return { acknowledged: true };
    }

    const token = await this.flowTokenService.signSingleUse({
      type: JwtTokenType.ACCOUNT_RECOVERY,
      purpose: 'account_recovery',
      payload: { sub: emailRow.userId, email: emailRow.email },
      expiresIn: '15m',
    });

    await emitBestEffort(
      this.eventEmitter,
      ACCOUNT_RECOVERY_EMAIL_REQUESTED_EVENT,
      new AccountRecoveryEmailRequestedEvent(emailRow.userId, emailRow.email, token),
    );

    return { acknowledged: true };
  }
}
