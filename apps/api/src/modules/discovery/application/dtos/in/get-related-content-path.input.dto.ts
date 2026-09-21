import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetRelatedContentPathDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  resourceId!: string;
}
