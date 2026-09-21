import { Module } from '@nestjs/common';
import { ViewModule } from '@/modules/view/view.module';
@Module({ imports: [ViewModule], exports: [ViewModule] })
export class ViewHttpPublicModule {}
