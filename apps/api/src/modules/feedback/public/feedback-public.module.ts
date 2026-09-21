import { Module } from '@nestjs/common';
import { FeedbackModule } from '../feedback.module';
@Module({ imports: [FeedbackModule], exports: [FeedbackModule] })
export class FeedbackPublicModule {}
