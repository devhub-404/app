import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResolveTagQueryDTO {
  @ApiProperty() @IsString() @MinLength(1) value!: string;
}
