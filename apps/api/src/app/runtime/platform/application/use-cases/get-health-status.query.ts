import { Injectable } from '@nestjs/common';
import type { GetHealthStatusInputDTO } from '@/app/runtime/platform/application/dtos/in';
import { HealthStatusDTO } from '@/app/runtime/platform/application/dtos/out';

@Injectable()
export class GetHealthStatusQuery {
  execute(_input: GetHealthStatusInputDTO): HealthStatusDTO {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
