import { Module } from '@nestjs/common';
import { QAndARepositoriesModule } from '../infrastructure/q-and-a-repositories.module';
import { QAndAPublicService, QAndAPublicServicePort } from './q-and-a-public.service';

@Module({
  imports: [QAndARepositoriesModule],
  providers: [{ provide: QAndAPublicServicePort, useClass: QAndAPublicService }],
  exports: [QAndAPublicServicePort],
})
export class QAndAPublicModule {}
