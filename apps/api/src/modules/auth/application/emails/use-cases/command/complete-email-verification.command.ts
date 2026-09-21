import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { FlowTokenService } from '@/modules/auth/application/shared/flow-token.service';
import { EmailVerificationTokenDTO } from '@/modules/auth/application/shared/dto';
import { AccountEmailAccessPort } from '@/modules/account/public/account-access.ports';
import { EmailVerifiedDTO } from '@/modules/auth/application/emails/dtos/out';

@Injectable()
export class CompleteEmailVerificationCommand {
  constructor(
    @Inject(FlowTokenService) private readonly flowTokenService: FlowTokenService,
    @Inject(AccountEmailAccessPort) private readonly userEmailRepository: AccountEmailAccessPort,
  ) {}

  async execute(token: string): Promise<EmailVerifiedDTO> {
    let payload: EmailVerificationTokenDTO;
    try {
      payload = await this.flowTokenService.verify(EmailVerificationTokenDTO, token);
    } catch {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    const current = await this.userEmailRepository.findByEmail(payload.email);
    if (!current || current.userId !== payload.sub || current.type !== 'primary') {
      throw new AppError('AUTH_TOKEN_INVALID');
    }

    if (current.verifiedAt !== null) {
      return {
        email: payload.email,
        type: 'primary',
        verifiedAt: current.verifiedAt,
      };
    }

    const verifiedAt = new Date();
    await this.userEmailRepository.setVerifiedAt(payload.sub, payload.email, verifiedAt);

    return {
      email: payload.email,
      type: 'primary',
      verifiedAt,
    };
  }
}
