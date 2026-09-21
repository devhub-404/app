import { DynamicModule, Global, Module } from '@nestjs/common';
import { UnitOfWork } from '@/shared/kernel/services/unit-of-work';
import type { DrizzleDatabaseService } from './db';
import { DrizzleUnitOfWork } from './unit-of-work';
import { ResourceIdentityStore } from './resource-identity.store';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';

@Global()
@Module({})
export class DrizzleModule {
  static forRoot(database: DrizzleDatabaseService): DynamicModule {
    return {
      module: DrizzleModule,
      providers: [
        { provide: 'DATABASE', useValue: database },
        DrizzleUnitOfWork,
        ResourceIdentityStore,
        { provide: ResourceIdentityPort, useExisting: ResourceIdentityStore },
        { provide: UnitOfWork, useExisting: DrizzleUnitOfWork },
      ],
      exports: ['DATABASE', UnitOfWork, DrizzleUnitOfWork, ResourceIdentityStore, ResourceIdentityPort],
    };
  }
}
