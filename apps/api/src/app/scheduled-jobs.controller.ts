import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Optional,
  Post,
  UnauthorizedException,
  Version,
} from '@nestjs/common';
import { env } from '@/app/config/env';
import { PurgeExpiredAuthArtifactsCommand } from '@/modules/auth/public';
import { PurgeOldNotificationsCommand } from '@/modules/notification/public';
import { PurgeExpiredMediaUploadsCommand } from '@/modules/media/public';
import { PurgeDeletedAccountsCommand } from '@/modules/account/public';

@Controller('internal/scheduled-jobs')
export class ScheduledJobsController {
  constructor(
    private readonly purgeAuthArtifacts: PurgeExpiredAuthArtifactsCommand,
    private readonly purgeOldNotifications: PurgeOldNotificationsCommand,
    private readonly purgeDeletedAccounts: PurgeDeletedAccountsCommand,
    @Optional() private readonly purgeExpiredMediaUploads?: PurgeExpiredMediaUploadsCommand,
  ) {}

  @Version('1')
  @Post('run')
  @HttpCode(HttpStatus.NO_CONTENT)
  async run(@Headers('x-devhub-scheduled-secret') secret?: string): Promise<void> {
    if (!env.scheduledJobsSecret || secret !== env.scheduledJobsSecret) throw new UnauthorizedException();
    await Promise.all([
      this.purgeAuthArtifacts.execute(),
      this.purgeOldNotifications.execute(),
      this.purgeDeletedAccounts.execute(),
      ...(this.purgeExpiredMediaUploads ? [this.purgeExpiredMediaUploads.execute()] : []),
    ]);
  }
}
