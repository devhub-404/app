import { Module } from '@nestjs/common';
import { FollowModule } from '../follow.module';

@Module({ imports: [FollowModule], exports: [FollowModule] })
export class FollowHttpPublicModule {}
