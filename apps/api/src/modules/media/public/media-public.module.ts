import { Module } from '@nestjs/common';
import { MediaModule } from '@/modules/media/media.module';

@Module({
  imports: [MediaModule],
  exports: [MediaModule],
})
export class MediaPublicModule {}
