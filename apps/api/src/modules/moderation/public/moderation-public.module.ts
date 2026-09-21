import { Module } from '@nestjs/common';
import { ModerationModule } from '../moderation.module';

@Module({ imports: [ModerationModule], exports: [ModerationModule] })
export class ModerationPublicModule {}
