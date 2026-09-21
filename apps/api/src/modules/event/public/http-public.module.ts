import { Module } from '@nestjs/common';
import { EventModule } from '../event.module';

@Module({ imports: [EventModule], exports: [EventModule] })
export class EventHttpPublicModule {}
