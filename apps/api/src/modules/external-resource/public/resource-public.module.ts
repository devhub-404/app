import { Module } from '@nestjs/common';
import { ExternalResourceRepositoriesModule } from '@/modules/external-resource/infrastructure/resource-repositories.module';
import { ExternalResourcePublicService } from '@/modules/external-resource/public/resource-public.service';
import { ExternalResourcePublicServicePort } from '@/modules/external-resource/public/resource-public.service.port';

@Module({
  imports: [ExternalResourceRepositoriesModule],
  providers: [{ provide: ExternalResourcePublicServicePort, useClass: ExternalResourcePublicService }],
  exports: [ExternalResourcePublicServicePort],
})
export class ExternalResourcePublicModule {}
