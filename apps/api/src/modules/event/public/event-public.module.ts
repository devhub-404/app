import { Module } from '@nestjs/common';
import { EventRepositoriesModule } from '../infrastructure/event-repositories.module';
import { EventPublicService, EventPublicServicePort } from './event-public.service';

@Module({
  imports: [EventRepositoriesModule],
  providers: [{ provide: EventPublicServicePort, useClass: EventPublicService }],
  exports: [EventPublicServicePort],
})
export class EventPublicModule {}
