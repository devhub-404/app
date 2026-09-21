import { Module } from '@nestjs/common';
import { QAndAModule } from '../q-and-a.module';

@Module({ imports: [QAndAModule], exports: [QAndAModule] })
export class QAndAHttpPublicModule {}
