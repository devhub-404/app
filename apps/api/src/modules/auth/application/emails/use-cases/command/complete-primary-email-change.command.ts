import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { EmailChangePrimaryTokenDTO } from '@/modules/auth/application/shared/dto';
import { AccountEmailAccessPort } from '@/modules/account/public/account-access.ports';
import { EmailChangeCompletedDTO } from '@/modules/auth/application/emails/dtos/out';

@Injectable()
export class CompletePrimaryEmailChangeCommand {
  constructor(
    @Inject(FlowTokenService) private readonly flowTokenService: FlowTokenService,
    @Inject(AccountEmailAccessPort) private readonly userEmailRepository: AccountEmailAccessPort,
  ) {}

  async execute(token: string): Promise<EmailChangeCompletedDTO> {
    let payload: EmailChangePrimaryTokenDTO;
    try {
      payload = await this.flowTokenService.verifySingleUse(EmailChangePrimaryTokenDTO, token, 'email_change_primary');
    } catch {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    const current = await this.userEmailRepository.findByEmail(payload.email);
    if (current && current.userId !== payload.sub) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }
    if (current && current.userId === payload.sub && current.type === 'primary' && current.verifiedAt !== null) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    if (!(await this.flowTokenService.consumeSingleUse(payload, 'email_change_primary'))) {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    await this.userEmailRepository.upsertPrimary({
      userId: payload.sub,
      email: payload.email,
      verifiedAt: new Date(),
    });

    return {
      email: payload.email,
      type: 'primary',
      verifiedAt: new Date(),
    };
  }
}
