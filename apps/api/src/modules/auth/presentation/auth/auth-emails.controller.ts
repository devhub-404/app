import { Body, Controller, Delete, Post, UseGuards, Version } from '@nestjs/common';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { LocalRateLimitGuard, RATE_LIMIT_POLICIES } from '@/app/runtime/rate-limit';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@/modules/auth/public/http';
import { Public } from '@/shared/nest/decorators/public';
import { User } from '@/modules/auth/public/http';
import type { AuthenticatedPrincipalDTO } from '@/modules/auth/public/http';
import { EmailChangeDTO, EmailTokenDTO } from '@/modules/auth/application/emails/dtos/in';
import {
  EmailChangeCompletedDTO,
  EmailVerifiedDTO,
  GenericAuthenticatedAckDTO,
} from '@/modules/auth/application/emails/dtos/out';
import { StartEmailVerificationCommand } from '@/modules/auth/application/emails/use-cases/command/start-email-verification.command';
import { CompleteEmailVerificationCommand } from '@/modules/auth/application/emails/use-cases/command/complete-email-verification.command';
import { StartPrimaryEmailChangeCommand } from '@/modules/auth/application/emails/use-cases/command/start-primary-email-change.command';
import { CompletePrimaryEmailChangeCommand } from '@/modules/auth/application/emails/use-cases/command/complete-primary-email-change.command';
import { StartBackupEmailChangeCommand } from '@/modules/auth/application/emails/use-cases/command/start-backup-email-change.command';
import { CompleteBackupEmailChangeCommand } from '@/modules/auth/application/emails/use-cases/command/complete-backup-email-change.command';
import { DeleteBackupEmailCommand } from '@/modules/auth/application/emails/use-cases/command/delete-backup-email.command';
import { ResendEmailVerificationCommand } from '@/modules/auth/application/emails/use-cases/command/resend-email-verification.command';
import { GenericPublicAckDTO } from '@/modules/auth/public/http';

@Controller()
@UseGuards(AuthGuard, LocalRateLimitGuard)
@Throttle({ local: RATE_LIMIT_POLICIES.authEmail })
export class AuthEmailsController {
  constructor(
    private readonly startEmailVerificationCommand: StartEmailVerificationCommand,
    private readonly completeEmailVerificationCommand: CompleteEmailVerificationCommand,
    private readonly startPrimaryEmailChangeCommand: StartPrimaryEmailChangeCommand,
    private readonly completePrimaryEmailChangeCommand: CompletePrimaryEmailChangeCommand,
    private readonly startBackupEmailChangeCommand: StartBackupEmailChangeCommand,
    private readonly completeBackupEmailChangeCommand: CompleteBackupEmailChangeCommand,
    private readonly deleteBackupEmailCommand: DeleteBackupEmailCommand,
    private readonly resendEmailVerificationCommand: ResendEmailVerificationCommand,
  ) {}

  @Version('1')
  @Post('emails/verify/resend')
  @Public()
  @AppResponse('EMAIL_VERIFICATION_RESENT', GenericPublicAckDTO)
  async resendEmailVerification(@Body() body: EmailChangeDTO): Promise<GenericPublicAckDTO> {
    return await this.resendEmailVerificationCommand.execute(body.email);
  }

  @Version('1')
  @Post('emails/verify/start')
  @AppResponse('EMAIL_VERIFICATION_STARTED', GenericAuthenticatedAckDTO)
  async startEmailVerification(@User() user: AuthenticatedPrincipalDTO): Promise<GenericAuthenticatedAckDTO> {
    return await this.startEmailVerificationCommand.execute(user.sub);
  }

  @Version('1')
  @Post('emails/verify/complete')
  @Public()
  @AppResponse('EMAIL_VERIFIED', EmailVerifiedDTO)
  async completeEmailVerification(@Body() body: EmailTokenDTO): Promise<EmailVerifiedDTO> {
    return await this.completeEmailVerificationCommand.execute(body.token);
  }

  @Version('1')
  @Post('emails/primary/change/start')
  @AppResponse('PRIMARY_EMAIL_CHANGE_STARTED', GenericAuthenticatedAckDTO)
  async startPrimaryEmailChange(
    @User() user: AuthenticatedPrincipalDTO,
    @Body() body: EmailChangeDTO,
  ): Promise<GenericAuthenticatedAckDTO> {
    return await this.startPrimaryEmailChangeCommand.execute(user.sub, user.sid, body.email);
  }

  @Version('1')
  @Post('emails/primary/change/complete')
  @Public()
  @AppResponse('PRIMARY_EMAIL_CHANGED', EmailChangeCompletedDTO)
  async completePrimaryEmailChange(@Body() body: EmailTokenDTO): Promise<EmailChangeCompletedDTO> {
    return await this.completePrimaryEmailChangeCommand.execute(body.token);
  }

  @Version('1')
  @Post('emails/backup/change/start')
  @AppResponse('BACKUP_EMAIL_CHANGE_STARTED', GenericAuthenticatedAckDTO)
  async startBackupEmailChange(
    @User() user: AuthenticatedPrincipalDTO,
    @Body() body: EmailChangeDTO,
  ): Promise<GenericAuthenticatedAckDTO> {
    return await this.startBackupEmailChangeCommand.execute(user.sub, user.sid, body.email);
  }

  @Version('1')
  @Post('emails/backup/change/complete')
  @Public()
  @AppResponse('BACKUP_EMAIL_CHANGED', EmailChangeCompletedDTO)
  async completeBackupEmailChange(@Body() body: EmailTokenDTO): Promise<EmailChangeCompletedDTO> {
    return await this.completeBackupEmailChangeCommand.execute(body.token);
  }

  @Version('1')
  @Delete('emails/backup')
  @AppResponse('BACKUP_EMAIL_DELETED')
  async deleteBackupEmail(@User() user: AuthenticatedPrincipalDTO): Promise<null> {
    await this.deleteBackupEmailCommand.execute(user.sub, user.sid);

    return null;
  }
}
