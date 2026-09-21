import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { EmailChangeBackupTokenDTO } from '@/modules/auth/application/shared/dto';
import { AccountEmailAccessPort } from '@/modules/account/public/account-access.ports';
import { EmailChangeCompletedDTO } from '@/modules/auth/application/emails/dtos/out';

@Injectable()
export class CompleteBackupEmailChangeCommand {
  constructor(
    @Inject(FlowTokenService) private readonly flowTokenService: FlowTokenService,
    @Inject(AccountEmailAccessPort) private readonly userEmailRepository: AccountEmailAccessPort,
  ) {}

  async execute(token: string): Promise<EmailChangeCompletedDTO> {
    let payload: EmailChangeBackupTokenDTO;
    try {
      payload = await this.flowTokenService.verifySingleUse(EmailChangeBackupTokenDTO, token, 'email_change_backup');
    } catch {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    const current = await this.userEmailRepository.findByEmail(payload.email);
    if (current && current.userId !== payload.sub) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }
    if (current && current.userId === payload.sub && current.type === 'backup' && current.verifiedAt !== null) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    if (!(await this.flowTokenService.consumeSingleUse(payload, 'email_change_backup'))) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    await this.userEmailRepository.upsertBackup({
      userId: payload.sub,
      email: payload.email,
      verifiedAt: new Date(),
    });

    return {
      email: payload.email,
      type: 'backup',
      verifiedAt: new Date(),
    };
  }
}
