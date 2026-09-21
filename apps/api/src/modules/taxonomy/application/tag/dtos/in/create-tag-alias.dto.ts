import { Transform } from 'class-transformer';
import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from '@/shared/utils/validators';

export class CreateTagAliasDTO {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  tagId!: string;

  @ApiProperty({ example: 'js' })
  @IsString()
  @MaxLength(64)
  @Transform(({ value }: { value: string }) => value?.trim())
  alias!: string;
}
