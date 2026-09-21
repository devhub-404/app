import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DrizzleModule } from '@/shared/infrastructure/database/drizzle/drizzle.module';
import { DrizzleDatabase } from '@/app/runtime/database/drizzle-database';
import { AccountPublicModule } from '@/modules/account/public';
import { AuthPublicModule } from '@/modules/auth/public';
import { ContentRootModule } from '@/app/content-root.module';
import { PlatformPublicModule } from '@/app/runtime/platform/public';
import { PublicationDeliveryModule } from '@/app/integrations/publication-delivery/publication-delivery.module';
import { ContactPublicModule } from '@/modules/contact/public';
import { FeedbackPublicModule } from '@/modules/feedback/public';
import { NotificationPublicModule } from '@/modules/notification/public';
import { InternalModule } from '@/app/internal.module';
import { ConfigurationModule } from '@/app/runtime/configuration/configuration.module';
import { RateLimitModule } from '@/app/runtime/rate-limit';

@Module({
  imports: [
    RateLimitModule,
    // The account purge event intentionally has more than ten subscribers.
    // Keep a finite limit so accidental listener leaks still remain visible.
    EventEmitterModule.forRoot({ maxListeners: 20 }),
    ConfigurationModule,
    DrizzleModule.forRoot(DrizzleDatabase),
    AccountPublicModule,
    AuthPublicModule,
    ContentRootModule,
    InternalModule,
    PlatformPublicModule,
    PublicationDeliveryModule,
    ContactPublicModule,
    FeedbackPublicModule,
    NotificationPublicModule,
  ],
})
export class AppModule {}
