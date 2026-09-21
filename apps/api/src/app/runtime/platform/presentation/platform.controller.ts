import { Controller, Get, Version } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { Public } from '@/shared/nest/decorators/public';
import { GetHealthStatusQuery } from '@/app/runtime/platform/application/use-cases/get-health-status.query';
import { GetReadinessStatusQuery } from '@/app/runtime/platform/application/use-cases/get-readiness-status.query';
import { GetHealthStatusInputDTO, GetReadinessStatusInputDTO } from '@/app/runtime/platform/application/dtos/in';
import { HealthStatusDTO, ReadinessStatusDTO } from '@/app/runtime/platform/application/dtos/out';

@Controller('platform')
@Public()
@SkipThrottle({ global: true, local: true })
export class PlatformController {
  constructor(
    private readonly getHealthStatusQuery: GetHealthStatusQuery,
    private readonly getReadinessStatusQuery: GetReadinessStatusQuery,
  ) {}

  @Version('1')
  @Get('health')
  @AppResponse('PLATFORM_HEALTH_RETRIEVED', HealthStatusDTO)
  getHealth(): HealthStatusDTO {
    return this.getHealthStatusQuery.execute(new GetHealthStatusInputDTO());
  }

  @Version('1')
  @Get('readiness')
  @AppResponse('PLATFORM_READINESS_RETRIEVED', ReadinessStatusDTO)
  async getReadiness(): Promise<ReadinessStatusDTO> {
    return this.getReadinessStatusQuery.execute(new GetReadinessStatusInputDTO());
  }
}
