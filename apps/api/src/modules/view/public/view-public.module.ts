import { Module } from '@nestjs/common';
import { ViewModule } from '@/modules/view/view.module';
import { ViewReadPort } from './view-read.port';
import { ViewReadService } from './view-read.service';
@Module({
  imports: [ViewModule],
  providers: [{ provide: ViewReadPort, useClass: ViewReadService }],
  exports: [ViewReadPort],
})
export class ViewPublicModule {}
