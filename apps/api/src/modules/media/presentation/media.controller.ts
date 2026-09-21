import { Body, Controller, Post, UseGuards, Version } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LocalRateLimitGuard, RATE_LIMIT_POLICIES } from '@/app/runtime/rate-limit';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { ConfirmMediaUploadCommand, RequestMediaUploadCommand } from '@/modules/media/application/use-cases';
import {
  ConfirmMediaUploadDTO,
  ConfirmedMediaUploadDTO,
  MediaUploadGrantDTO,
  RequestMediaUploadDTO,
} from '@/modules/media/application/dtos';
import { AuthGuard } from '@/modules/auth/public/http';
import { User } from '@/shared/nest/decorators/user.decorator';
import { AppError } from '@/shared/errors/app-error';

@Controller('media/uploads')
@UseGuards(AuthGuard, LocalRateLimitGuard)
@Throttle({ local: RATE_LIMIT_POLICIES.mediaUploads })
export class MediaController {
  constructor(
    private readonly requestMediaUpload: RequestMediaUploadCommand,
    private readonly confirmMediaUpload: ConfirmMediaUploadCommand,
  ) {}

  @Version('1')
  @Post()
  @AppResponse('UPLOAD_URL_GENERATED', MediaUploadGrantDTO)
  request(@User('id') ownerId: string, @Body() payload: RequestMediaUploadDTO) {
    return this.requestMediaUpload.execute({ ownerId, ...payload });
  }

  @Version('1')
  @Post('confirm')
  @AppResponse('UPLOAD_CONFIRMED', ConfirmedMediaUploadDTO)
  async confirm(@User('id') ownerId: string, @Body() payload: ConfirmMediaUploadDTO) {
    const asset = await this.confirmMediaUpload.execute({ ownerId, ...payload });
    if (!asset) throw new AppError('UPLOAD_ASSET_NOT_AVAILABLE');

    return asset;
  }
}
