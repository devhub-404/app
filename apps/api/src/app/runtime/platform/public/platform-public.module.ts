import { Module } from '@nestjs/common';
import { PlatformModule } from '../platform.module';

@Module({ imports: [PlatformModule], exports: [PlatformModule] })
export class PlatformPublicModule {}
