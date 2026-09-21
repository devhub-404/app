import { forwardRef, Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { MediaStorageModule } from '@/modules/media/media-storage.module';
import { MediaService } from '@/modules/media/infrastructure/media.service';
import { MediaServicePort } from '@/modules/media/public/media.service.port';
import { MediaController } from '@/modules/media/presentation/media.controller';
import {
  ConfirmMediaUploadCommand,
  PurgeExpiredMediaUploadsCommand,
  RequestMediaUploadCommand,
} from '@/modules/media/application/use-cases';
import { MediaObjectRepository } from '@/modules/media/application/ports/repositories/media-object.repository';
import { DrizzleMediaObjectRepository } from '@/modules/media/infrastructure/repositories/media-object.repository';

@Module({
  imports: [forwardRef(() => AuthPublicModule), MediaStorageModule],
  controllers: [MediaController],
  providers: [
    { provide: MediaServicePort, useClass: MediaService },
    RequestMediaUploadCommand,
    ConfirmMediaUploadCommand,
    PurgeExpiredMediaUploadsCommand,
    { provide: MediaObjectRepository, useClass: DrizzleMediaObjectRepository },
  ],
  exports: [MediaServicePort, PurgeExpiredMediaUploadsCommand],
})
export class MediaModule {}
