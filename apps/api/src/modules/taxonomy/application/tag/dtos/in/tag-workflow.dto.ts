import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MergeTagsDTO {
  @ApiProperty() @IsUUID() sourceTagId!: string;
  @ApiProperty() @IsUUID() targetTagId!: string;
}
