import { Module } from '@nestjs/common';
import { DiscoveryModule } from '../discovery.module';

@Module({ imports: [DiscoveryModule], exports: [DiscoveryModule] })
export class DiscoveryHttpPublicModule {}
