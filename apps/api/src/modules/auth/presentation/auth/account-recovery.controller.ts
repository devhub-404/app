import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LocalRateLimitGuard, RATE_LIMIT_POLICIES } from '@/app/runtime/rate-limit';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { Public } from '@/shared/nest/decorators/public';
import { GenericPublicAckDTO } from '@/modules/auth/public/http';
import { AccountRecoveryCompleteDTO, AccountRecoveryStartDTO } from '@/modules/auth/application/auth/dtos/in';
import { AccountRecoveredDTO } from '@/modules/auth/application/auth/dtos/out';
import { StartAccountRecoveryCommand } from '@/modules/auth/application/auth/use-cases/command/start-account-recovery.command';
import { CompleteAccountRecoveryCommand } from '@/modules/auth/application/auth/use-cases/command/complete-account-recovery.command';

@Controller()
@UseGuards(LocalRateLimitGuard)
@Throttle({ local: RATE_LIMIT_POLICIES.authSensitive })
export class AccountRecoveryController {
  constructor(
    private readonly startAccountRecoveryCommand: StartAccountRecoveryCommand,
    private readonly completeAccountRecoveryCommand: CompleteAccountRecoveryCommand,
  ) {}

  @Version('1')
  @Post('account-recovery/start')
  @Throttle({ local: RATE_LIMIT_POLICIES.authEmail })
  @Public()
  @AppResponse('ACCOUNT_RECOVERY_STARTED', GenericPublicAckDTO)
  async startAccountRecovery(@Body() body: AccountRecoveryStartDTO): Promise<GenericPublicAckDTO> {
    return await this.startAccountRecoveryCommand.execute(body.email);
  }

  @Version('1')
  @Post('account-recovery/complete')
  @Public()
  @AppResponse('ACCOUNT_RECOVERED', AccountRecoveredDTO)
  async completeAccountRecovery(@Body() body: AccountRecoveryCompleteDTO): Promise<AccountRecoveredDTO> {
    return await this.completeAccountRecoveryCommand.execute({ token: body.token });
  }
}
