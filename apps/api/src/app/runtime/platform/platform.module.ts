import { Module } from '@nestjs/common';
import { PlatformController } from '@/app/runtime/platform/presentation/platform.controller';
import { GetHealthStatusQuery } from '@/app/runtime/platform/application/use-cases/get-health-status.query';
import { GetReadinessStatusQuery } from '@/app/runtime/platform/application/use-cases/get-readiness-status.query';

@Module({
  controllers: [PlatformController],
  providers: [GetHealthStatusQuery, GetReadinessStatusQuery],
})
export class PlatformModule {}
